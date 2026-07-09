# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"AI Learning Radar" — an Airtable-style table for tracking technical learning
articles (title, source, topic, difficulty, priority, status, etc.), with
suggestion-fetching, manual paste-to-parse, filtering/sorting, a study-plan
generator, and a progress chart. React + TypeScript + Vite frontend backed by
an Express server. Built for an Airtable interview assignment — see
[README.md](README.md) for the original spec, [BUILD_PLAN.md](BUILD_PLAN.md)
for full architecture/what's deferred, and [RUNBOOK.md](RUNBOOK.md) for a
feature walkthrough.

## Commands

```bash
npm run dev:all        # client (Vite, :5173) + server (Express, :3001) together
npm run dev             # client only
npm run server           # server only (tsx watch mode)

npm run test             # vitest run (single run, CI mode)
npm run test:watch       # vitest watch mode
npx vitest run path/to/file.test.ts      # single test file
npx vitest run -t "test name substring"  # single test by name

npx tsc -b --noEmit      # typecheck client + server project references
npm run lint              # eslint over src/ and server/
npm run build              # typecheck + vite build (client only, to dist/)
npm run preview             # serve the production build locally
```

No `.env` file or API keys are required to run or test — everything defaults
to in-memory storage and a deterministic mock parser. `SERVER_PORT`,
`DB_PROVIDER`, and `LLM_PROVIDER` are the only env vars read (see
`.env.example`); if you change `SERVER_PORT`, set it for **both** processes
(`SERVER_PORT=4000 npm run dev:all`) since the Vite proxy target depends on it.

## Architecture

**Two npm workspaces sharing one `src/utils/` — not a monorepo, just relative
imports.** `server/` (Express/tsx) imports directly from `src/types` and
`src/utils` (see `tsconfig.server.json`'s `include`). The mock content parser
(topic inference, priority scoring, hash-derived fields) lives once in
`src/utils/parseArticleInput.ts` and is reused server-side by
`server/llm/MockContentParser.ts` rather than reimplemented. Any change to
`src/utils/` can affect both client and server behavior.

**Client never talks to external APIs directly.** All data flows through the
Express server under `/api/*`, proxied by Vite in dev/preview
(`vite.config.ts`) so there's no CORS or base-URL config. `src/api/client.ts`
is the one fetch wrapper; `src/api/articles.ts` / `src/api/suggestions.ts`
build on it.

**Two swap-point interfaces are the deliberate seam in this codebase** (see
BUILD_PLAN.md "Core abstractions"):
- `ArticleRepository` (`server/repository/`) — currently only
  `InMemoryArticleRepository` (a `Map`, seeded from
  `server/fixtures/learningRows.ts`). A `SqlArticleRepository` is the
  documented future swap; routes never change.
- `ContentParser` (`server/llm/`) — `MockContentParser` (deterministic,
  no network) or `OpenAIContentParser` (fetches the article's URL via
  `fetchPageText`, sends it to a `ChatAgent`, normalizes/validates the JSON
  response against the `LearningFocus`/`Difficulty`/`Priority` option
  lists). `OpenAIContentParser` itself doesn't call OpenAI directly — it
  takes a `ChatAgent` (`server/llm/agents/`) in its constructor, defaulting
  to `OpenAIChatAgent`; swapping models/vendors means implementing
  `ChatAgent`, not touching the parser.
- Both repository/parser are selected in `server/config.ts` via
  `getRepository()` / `getContentParser()`, the **only** place
  `DB_PROVIDER`/`LLM_PROVIDER` env vars are read. Both are memoized
  module-level singletons — a fresh instance per call would silently reset
  state on every request. Selecting an unimplemented provider (`sql`)
  throws immediately rather than silently falling back.
- `POST /api/articles/parse` wraps `getContentParser().parse()` in a
  try/catch that returns 502 on failure — needed once a parser can hit a
  real network/API (bad URL, missing `OPENAI_API_KEY`, model returning
  invalid JSON), not just the deterministic mock.

**State ownership:** `src/state/useLearningTable.ts` is the single hook
owning all table state (a `useReducer`), all server round-trips, and all
derived data (`visibleRows` via filter+sort, `studyPlan`, `metrics`,
`dailyProgress`, `sourceOptions`). Components read from and call into this
hook; they don't fetch or hold row state themselves.

**Optimistic vs. explicit-loading CRUD, deliberately inconsistent:** plain
row CRUD (add/update/delete) applies optimistically — reducer updates
immediately, the API call fires in the background, errors just get
`console.error`'d. Fetch Suggestions and manual-entry parsing instead go
through an explicit loading/error state cycle (`FETCH_*`/`PARSE_*` actions),
because `server/utils/simulateLatency.ts` deliberately adds ~500-900ms
latency and a ~12% failure rate to *only those two* endpoints, to simulate a
real upstream call and exercise the loading/error UI. This is intentional,
not a bug — don't "fix" the failure rate or latency without checking
RUNBOOK.md's "Known non-bugs" section.

**Status changes stamp `statusUpdatedAt` client-side** (in `updateRow`,
`src/state/useLearningTable.ts`) so the optimistic update and the persisted
value match exactly — `src/utils/progressOverTime.ts` buckets rows by this
field to drive the progress chart.

**`ArticleSource` is derived, not an enum** — it's the row's URL host (e.g.
`dev.to`), computed in `src/utils/parseArticleInput.ts`, with `"Manual"` as
the only sentinel value for rows with no URL. The Toolbar's source filter
options are computed from whatever sources are actually present in current
data (`sourceOptions` in `useLearningTable.ts`), not a fixed list.

## Directory reference

```
src/types/        LearningRow, StudyPlan, LearningFocus, etc. — the data model
src/utils/         pure functions: filtering, sorting, topic inference,
                   priority scoring, mock parser, study plan, metrics,
                   progress-over-time — shared with server/ via relative import
src/api/            client.ts (fetch wrapper) + articles.ts / suggestions.ts
src/state/          useLearningTable — all table state + server sync
src/components/     Table, Toolbar, FetchSuggestions, ManualEntry,
                    StudyPlanPanel, ProgressChart, MetricsBar

server/index.ts      createApp() + listen()
server/config.ts      getRepository()/getContentParser() — the only place
                      DB_PROVIDER/LLM_PROVIDER are read
server/routes/         articles.ts, suggestions.ts
server/repository/      ArticleRepository interface + InMemoryArticleRepository
server/llm/              ContentParser interface, MockContentParser,
                        OpenAIContentParser, agents/ (ChatAgent interface +
                        OpenAIChatAgent), fetchPageText.ts
server/fixtures/          seed data + canned suggestion sources (server-only,
                          not shipped to the client bundle)
server/utils/simulateLatency.ts   the latency/failure simulation described above
```
