# Build Plan — AI Learning Radar

Airtable-style learning tracker. React + TypeScript + Vite frontend, backed by
an Express server that's designed to swap its in-memory store and mock parser
for real infrastructure without touching UI code.

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (dense, utility-driven — fits an Airtable-style grid)
- **Server**: Express + TypeScript, run via `tsx` (dev) — REST endpoints under `/api`
- **DB (now)**: in-memory store behind a repository interface
- **LLM (now)**: deterministic mock parser behind a provider interface
- **Data fetching (client)**: `src/api/client.ts` fetch wrapper hitting
  relative `/api/*` paths, proxied to the Express server by Vite in both dev
  and preview (`vite.config.ts`) — no CORS setup, no base-URL config

## Core abstractions (the swap points)

Two seams matter most because the README explicitly calls out future swaps.
Build both as interfaces from day one so the concrete implementation is a
drop-in, not a rewrite.

### 1. Article repository (in-memory → real DB)

**Status: interface + `InMemoryArticleRepository` implemented** (`server/repository/`).

```ts
// server/repository/ArticleRepository.ts
interface ArticleRepository {
  list(): Promise<LearningRow[]>;
  get(id: string): Promise<LearningRow | null>;
  create(row: LearningRow): Promise<LearningRow>;
  update(id: string, patch: Partial<LearningRow>): Promise<LearningRow | null>;
  delete(id: string): Promise<boolean>;
}
```

- `InMemoryArticleRepository` — `Map<string, LearningRow>`, seeded from
  `server/fixtures/learningRows.ts`. Ships now.
- Future: `SqlArticleRepository` (Prisma/Drizzle over Postgres or SQLite)
  implementing the same interface. Routes never change.
- Selected via `getRepository()` in `server/config.ts`, reading
  `DB_PROVIDER=memory|sql`. `sql` currently throws a clear "not implemented"
  error rather than silently falling back — `memory` is the only real path.
  The factory memoizes its instance so all routes share one repository
  (a fresh instance per call would silently reset state on every request).

### 2. Content parser / LLM (mock → OpenAI)

**Status: interface + `MockContentParser` implemented** (`server/llm/`);
`OpenAIContentParser` not started.

```ts
// server/llm/ContentParser.ts
interface ContentParser {
  parse(input: { url?: string; rawText?: string; title?: string; topicOverride?: LearningFocus }): Promise<{
    title: string;
    topic: LearningFocus;
    difficulty: Difficulty;
    priority: Priority;
    estimatedTime: number;
    interviewRelevance: number;
    keyTakeaway: string;
    nextAction: string;
  }>;
}
```

- `MockContentParser` — thin wrapper delegating to `src/utils/parseArticleInput.ts`
  (topic inference + priority scoring + hash-derived fields, shared with the
  rest of the app rather than reimplemented server-side). No network calls,
  no latency, fully reproducible for demo/testing.
- `OpenAIContentParser` — not built. Same interface, would call OpenAI
  (structured output / JSON mode) to do the actual parsing.
- Selected via `getContentParser()` in `server/config.ts`, reading
  `LLM_PROVIDER=mock|openai`. `openai` currently throws a clear "not
  implemented" error. Default `mock` so the app runs with zero API keys.

Both factories live in `server/config.ts` and are the only place env vars are
read — nothing downstream branches on provider type.

## Data model

```ts
type LearningFocus =
  | "react-performance"
  | "frontend-system-design"
  | "typescript"
  | "ai-coding-agents"
  | "accessibility"
  | "airtable-data-modeling";

type StudyStatus = "To Read" | "Reading" | "Summarized" | "Practiced" | "Done";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Priority = "Low" | "Medium" | "High";

interface ArticleItem {
  id: string;
  title: string;
  source: string; // derived from the url's site host — see "Source is the site host" below
  url: string;
}

interface LearningRow extends ArticleItem {
  topic: LearningFocus;
  difficulty: Difficulty;
  priority: Priority;
  status: StudyStatus;
  estimatedTime: number; // minutes
  interviewRelevance: number; // 0-100
  keyTakeaway: string;
  nextAction: string;
  createdAt: string;
  statusUpdatedAt: string; // equals createdAt until status changes at least once
}

interface StudyPlan {
  highPriority: LearningRow | null;
  practicalCoding: LearningRow | null;
  leadershipSystemDesign: LearningRow | null;
  totalEstimatedMinutes: number;
}
```

`statusUpdatedAt` (added for the progress chart, see below) is stamped
**client-side**, in `useLearningTable.updateRow`, whenever a patch includes a
`status` field — not server-side — so the optimistic UI value and the
persisted value are identical rather than racing each other. New rows
(create, Fetch Suggestions, manual parse) get `statusUpdatedAt = createdAt`
from the server, since nothing has progressed yet.

## Folder layout

Reflects what's actually in the repo (see `git ls-files src/ server/` for
ground truth — this section is a map, not the source of truth).

```
src/
  types/                 ArticleItem, LearningRow, StudyStatus, StudyPlan, LearningFocus
  api/
    client.ts             fetch wrapper; relative /api/* paths, Vite-proxied
                          to the Express server (dev + preview)
    articles.ts            listArticles / createArticle / updateArticle /
                          deleteArticle / parseManualEntry — all real HTTP calls
    suggestions.ts         fetchSuggestions — real HTTP call
  utils/
    hash.ts                deterministic string hash powering the mock parser
    topicInference.ts       keyword-match topic classifier
    priorityScoring.ts      interview-relevance → Low/Medium/High heuristic
    parseArticleInput.ts    the mock "LLM" — combines the three above into
                          the ParsedArticleFields shape ContentParser returns.
                          Imported directly by server/llm/MockContentParser.ts
                          (shared, not duplicated, across the client/server boundary)
    filtering.ts            status / topic / difficulty / priority / source / search
    sorting.ts               priority / topic / estimatedTime
    studyPlan.ts
    metrics.ts
    progressOverTime.ts     computeDailyProgress() — buckets statusUpdatedAt
                          into daily completed/progressed counts for the chart
    id.ts                   generateRowId() — also imported server-side for row ids
  state/
    useLearningTable.ts   fetches from the server on mount; optimistic
                          add/update/delete (local dispatch + background sync);
                          explicit loading/error cycle for fetch-suggestions
                          and manual-parse, which hit the two endpoints that
                          simulate upstream latency/failure
  components/
    Table/                Table, TableRow, columns config, EditableCell,
                          SelectCell, TitleUrlCell (sticky combined title+url
                          cell), badgeStyles
    Toolbar/               FilterSelect (generic) + search box + sort controls
    FetchSuggestions/      focus picker + fetch button + loading/error UI
    ManualEntry/            paste link/notes form
    StudyPlanPanel/
    ProgressChart/          14-day stacked column chart (dataviz-skill compliant)
    MetricsBar/
  test/
    factories.ts           makeRow() shared test fixture builder — also
                          imported by server/**/*.test.ts
    setup.ts                jest-dom matchers + RTL cleanup (see Testing below)
  App.tsx                 renders init loading/error state before the table

server/
  index.ts                createApp() (exported for supertest) + listen();
                          skips listen() when NODE_ENV=test
  config.ts               getRepository() / getContentParser() factories,
                          memoized singletons, read DB_PROVIDER / LLM_PROVIDER
  routes/
    articles.ts            GET/POST /api/articles, POST /api/articles/parse,
                          PATCH/DELETE /api/articles/:id
    suggestions.ts          POST /api/suggestions
  repository/
    ArticleRepository.ts
    InMemoryArticleRepository.ts
  llm/
    ContentParser.ts
    MockContentParser.ts   wraps src/utils/parseArticleInput.ts
    (OpenAIContentParser.ts — not built; getContentParser() throws a clear
    error for LLM_PROVIDER=openai until it lands)
  fixtures/
    learningRows.ts         seed data for InMemoryArticleRepository (moved
                          from src/mocks/fixtures/ — no longer shipped to the client)
    suggestionSources.ts    canned per-focus "search results" — 10 real newsletters
                          per focus, sourced from the awesome-tech-newsletter
                          directory (see "Real newsletter suggestion data" below);
                          static, not a live API call — see Phase 2 below
  utils/
    simulateLatency.ts      ~500-900ms delay + ~12% failure, applied only to
                          POST /api/suggestions and POST /api/articles/parse
                          (plain CRUD stays fast — no artificial latency)
```

`src/mocks/` no longer exists — its two responsibilities split cleanly:
fixtures moved to `server/fixtures/`, and the latency/error simulation moved
to `server/utils/simulateLatency.ts`, called only from the two routes that
stand in for a real upstream call.

## Phase 0 — Scaffolding

- `npm create vite@latest` (react-ts template), Tailwind setup, ESLint/Prettier
- Folder skeleton above, `types/index.ts` filled in first since everything
  else depends on it
- Static mock fixtures: ~15-20 sample rows covering all topics/statuses so the
  UI never looks empty during Phase 1

## Phase 1 — UI with mock data (no server)

**Status: ✅ Complete.** Everything runs client-side against fixtures; `api/`
calls resolved from an in-memory mock module (`src/mocks/`) with simulated
latency + a ~12% simulated error rate (so loading/error states were real, not
hypothetical). Verified clean: typecheck, lint, 56 Vitest tests, production
build, and a manual Playwright walkthrough of every flow below.

*(`src/mocks/` was removed in Phase 2 — see below. This section is kept as
the historical record of what Phase 1 shipped; the rows/flows it describes
are unchanged, only where the data comes from moved.)*

1. Table: render rows, inline cell editing per column type (select for
   topic/status/difficulty/priority, text for takeaway/next action, number
   for estimated time). Title and URL are **consolidated into one sticky
   column** — title renders as the clickable link (href = url), with a
   pencil-icon affordance that opens both fields for editing together; the
   column stays pinned during horizontal scroll.
2. Row add / delete
3. Sort (priority, topic, estimated time) and filter — **expanded beyond the
   original status/topic scope** to also cover difficulty, priority, source,
   and a live title search box. Pure functions in `utils/`, table state via
   `useLearningTable`.
4. Status transitions (To Read → Reading → Summarized → Practiced → Done)
5. "Fetch Suggestions": focus picker → mock fetch → mock `ContentParser`
   equivalent client-side (`utils/parseArticleInput.ts` — the same function
   `server/llm/MockContentParser.ts` wraps in Phase 2) → appended rows
6. Manual paste entry (link or notes) → same mock parsing path
7. Study Plan panel: pure function picking 1 high-priority / 1 practical
   coding / 1 leadership-system-design row
8. Metrics bar: total, To Read, Completed, high-priority, today's estimated
   time
9. Loading/error states for fetch and parse actions

**Exit criteria**: full demo walkthrough works end-to-end with zero backend,
deterministic and demo-safe. Met.

## Testing

Vitest + React Testing Library, co-located with source (`*.test.ts` /
`*.test.tsx` next to the file they cover). `src/test/setup.ts` wires
`@testing-library/jest-dom` matchers and an explicit `afterEach(cleanup)` —
RTL's auto-cleanup depends on a global `afterEach`, which isn't present since
`vitest.config` globals are intentionally left off (tests import
`describe`/`it`/`expect` explicitly rather than relying on injected globals).
`src/test/factories.ts` holds `makeRow()`, a shared `LearningRow` builder, to
keep test setup out of individual test bodies.

Coverage as of Phase 1: `utils/*` (parsing determinism, filtering, sorting,
study plan selection, metrics), the `useLearningTable` reducer (including
mocked fetch/parse success and error paths), and `Table` interactions
(inline edit, select edit, delete, sticky-column class, link vs. plain-text
title rendering, Escape-to-discard).

**Added in Phase 2**: `server/**/*.test.ts` — `InMemoryArticleRepository`
(CRUD + newest-first ordering), `MockContentParser` (determinism +
`topicOverride`), and both route files via `supertest` against `createApp()`
(status codes, 404s on unknown ids, 400 on invalid focus, 502 when the
simulated-latency mock rejects). Route tests `vi.mock` `server/utils/simulateLatency`
and call `vi.resetModules()` + a fresh dynamic `import('../index')` in
`beforeEach` — the repository singleton in `config.ts` is memoized per module
graph, so a reset is required to get an isolated repository per test rather
than one shared (and mutated) across the whole file. `useLearningTable.test.ts`
was rewritten for the new async-init + optimistic-CRUD model: a
`renderLoadedTable()` helper mocks `listArticles()` and waits for
`initStatus` to settle before each test drives filters/sort/CRUD/fetch/parse.

**Added post-Phase 2**: `progressOverTime.test.ts` (daily bucketing,
day-boundary and never-progressed exclusion, same-day aggregation) and
`ProgressChart.test.tsx` (empty state, legend totals, one bar per day, hover
tooltip content, accessible table row count).

91 tests total. Run via `npm run test` (single pass) or `npm run test:watch`.

## Phase 2 — Server integration

**Status: substantially complete.** The client is fully server-backed —
`src/mocks/` is gone, `src/api/*.ts` makes real HTTP calls, and the table
loads from and persists to an Express server. Verified clean: typecheck
(client + server project references), lint, 80 Vitest tests (56 client + 24
server/route), production build, and a manual Playwright walkthrough against
both processes running together (see "What was verified" below). Two pieces
remain explicitly deferred — real external API calls and OpenAI — both
scoped out below rather than left ambiguous.

1. ✅ Express server; `MockContentParser` (`server/llm/MockContentParser.ts`)
   wraps `src/utils/parseArticleInput.ts` directly rather than reimplementing
   it — one source of truth for the parsing heuristics, shared across the
   client/server boundary via a relative import (see `tsconfig.server.json`,
   which uses `moduleResolution: bundler` like the client project so the
   import paths don't need `.js` extensions; `tsx` resolves them fine at runtime)
2. ✅ `InMemoryArticleRepository` + REST routes: `GET/POST /api/articles`,
   `PATCH/DELETE /api/articles/:id`, `POST /api/articles/parse` (manual
   entry), `POST /api/suggestions` (focus-based fetch). All implemented in
   `server/routes/`.
3. ⏸️ **Partially deferred.** "Move real external API calls server-side (HN,
   DEV.to, Medium RSS)" — `POST /api/suggestions` is still a static lookup,
   not a live HTTP call at request time. It's no longer *fabricated* data,
   though: `server/fixtures/suggestionSources.ts` now holds 10 real
   newsletters per focus (60 total), sourced from the
   [awesome-tech-newsletter](https://github.com/Infrasity-Labs/awesome-tech-newsletter)
   directory — real names, real homepage URLs — see "Real newsletter
   suggestion data" below for the full story. The route is still structured
   so swapping the fixture lookup for an actual live fetch (HN Algolia API,
   DEV.to API, an RSS reader, etc.) is a same-shaped change (raw `{title,
   url, source}` in, same response out) — that swap is still future work.
4. ✅ `src/api/client.ts` fetch wrapper; `api/suggestions.ts` / `api/articles.ts`
   now call it against relative `/api/*` paths. Vite's dev **and** preview
   proxy (`vite.config.ts`) forward those to the Express server on
   `SERVER_PORT` (default 3001) — no CORS handling needed, no base-URL config.
5. ⏸️ **Deferred, not done.** `OpenAIContentParser`. `getContentParser()` in
   `server/config.ts` reads `LLM_PROVIDER` and throws a clear "not
   implemented" error for `openai` rather than silently no-op'ing; `mock`
   remains the only real path and the default.
6. ✅ Persistence + optimistic updates, `useLearningTable.ts`: rows load from
   `GET /api/articles` on mount (`initStatus`/`initError`, with a `retryInit`
   the App's error state calls — no full page reload needed). Add/update/delete
   apply to local state immediately and sync to the server in the background
   (`console.error` on a failed background sync; no rollback UI — a known
   tradeoff, see below). Fetch Suggestions and manual-entry parsing keep the
   Phase 1 explicit loading/error cycle, because those two endpoints are the
   ones that simulate upstream latency (~500-900ms) and a ~12% failure rate
   (`server/utils/simulateLatency.ts`) — plain CRUD has no artificial delay.
7. ✅ Test coverage extended — see Testing section above.

**Known tradeoffs from this pass** (candidates for the final tradeoffs list):
optimistic update/delete have no rollback UI if the background sync fails —
acceptable because plain CRUD against the in-memory repository essentially
never fails, but would need addressing before a real DB introduces real
failure modes (network partition, constraint violation); the repository
singleton is process-local in-memory state, so it resets on server restart
and won't work if the server is ever scaled to multiple instances without a
shared store; suggestion data is real but static (item 3 above and the
section below) — same 10 newsletters every time for a given focus, not a
live, freshening feed, so "Fetch Suggestions" demonstrates the pipeline
shape and surfaces genuinely real reading material, but not *new* content
over time.

**What was verified** (manual Playwright walkthrough, `npm run dev:all`):
initial load from the server; inline title/URL edit surviving a full page
reload (confirmed via direct `GET /api/articles`, not just the DOM); add row
→ delete row round trip; Fetch Suggestions succeeding, persisting rows
server-side, *and* the 502 simulated-failure path rendering the error banner
with a working Retry; manual entry parsing and persisting. No console errors
outside the one intentionally-triggered 502 from the failure-path test.

**Exit criteria**: identical UI/UX to Phase 1, now backed by a real server,
structurally ready to swap `InMemoryArticleRepository` for a SQL-backed one
and to add `OpenAIContentParser` later. Met, modulo the two deferred items
above (real external fetches, OpenAI) which were never claimed as done.

## Study Progress chart (added post-Phase 2)

**Status: ✅ Complete.** Not in the original README/plan — added on request: "based
on status update time, compare study progress in the last 14 days and display
that as a chart."

- **Data model**: `statusUpdatedAt` added to `LearningRow` (see Data model
  above) — this is what makes "progress over time" answerable at all; before
  this, only `createdAt` existed, which can't distinguish "added two weeks
  ago and untouched since" from "added two weeks ago, finished today."
- **`src/utils/progressOverTime.ts`** — `computeDailyProgress(rows, days=14, now=new Date())`
  buckets rows by the UTC date-key of `statusUpdatedAt` into `{ date, completed, progressed }`
  per day, oldest first. Rows where `statusUpdatedAt === createdAt` (never
  progressed) are excluded entirely rather than counted as a zero-day event.
  Pure function, `now` injectable for deterministic tests.
- **`components/ProgressChart/ProgressChart.tsx`** — a 14-bar stacked column
  chart (Completed = emerald-600, Progressed = amber-600, stacked with a 2px
  surface gap, 4px rounded data-end on whichever segment is topmost, ≤24px
  bar width), a legend with running totals (always shown for 2 series), a
  per-bar hover/focus tooltip (exact date + counts), an empty state when
  there's no activity in the window, and a visually-hidden (`sr-only`)
  `<table>` mirroring every bar's data for screen readers / the "table view
  must exist" accessibility requirement. Built following the `dataviz` skill's
  procedure rather than freehanded: form chosen as a stacked column chart
  (discrete daily counts, two-part composition, not a continuous trend →
  bars, not a line); the emerald/amber pair was run through
  `scripts/validate_palette.js` — the first choice (`emerald-500`/`amber-400`)
  **failed** the lightness-band and contrast checks, `emerald-600`/`amber-600`
  passes all four (lightness band, chroma floor, CVD separation, ≥3:1 contrast).
- **Wiring**: `useLearningTable` computes `dailyProgress` via `useMemo` off
  `rows` (same pattern as `studyPlan`/`metrics`) and exposes it; `App.tsx`
  renders `<ProgressChart>` between the Study Plan panel and the Fetch
  Suggestions/Manual Entry row.
- **Where `statusUpdatedAt` gets set**: client-side, in
  `useLearningTable.updateRow` — see the Data model note above. Server
  routes (`POST /api/articles`, `POST /api/articles/parse`,
  `POST /api/suggestions`) set it equal to `createdAt` for every new row.
- **Seed data**: `server/fixtures/learningRows.ts` rewritten to use a
  `daysAgo(days, hour, minute)` helper instead of hardcoded calendar dates —
  `statusUpdatedAt` values are staggered across the last ~12 days for the 9
  rows that aren't "To Read" (2 landing on "Done"), so the chart has a
  realistic, uneven pattern immediately after a fresh checkout, regardless
  of what day it's actually run.
- **Tests**: `progressOverTime.test.ts` (bucketing, day-boundary exclusion,
  same-day aggregation, the never-progressed exclusion) and
  `ProgressChart.test.tsx` (empty state, legend totals, one button per day,
  hover tooltip content, the accessible table row count).
- **Verified**: full typecheck/lint/test/build, plus a manual Playwright
  walkthrough confirming the chart renders correctly, the hover tooltip shows
  exact counts, marking a row "Done" through the Status cell updates *today's*
  bar live (no reload), and that update survives a page reload (confirmed
  server-persisted, not just local state).

## Real newsletter suggestion data (added post-Phase 2)

**Status: ✅ Complete.** Requested: "update prefetch data, 10 article[s],
getting article[s] from possible newsletter in
[Infrasity-Labs/awesome-tech-newsletter](https://github.com/Infrasity-Labs/awesome-tech-newsletter)."

- **What changed**: `server/fixtures/suggestionSources.ts` went from 4
  fabricated placeholder items per focus (24 total, fake titles like "Why
  React Re-renders and How to Stop Them" attached to fake `dev.to/some-author/...`
  URLs) to **10 real newsletters per focus (60 total)** — real names, real
  homepage URLs, pulled from that repo's curated directory. Titles are now
  `"{newsletter name} — {its own tagline}"`, not an invented article
  headline, so nothing claims a specific article exists that doesn't; a
  fabricated URL attached to a real newsletter's name would have been worse
  than the original placeholder data, not better.
- **New `ArticleSource` value**: `'Newsletter'` (`src/types/index.ts`) —
  most of the 60 entries are Substack/Beehiiv/Ghost/Hashnode/standalone
  sites, which didn't fit the existing `'Hacker News' | 'DEV.to' | 'Medium' | 'Manual'`
  union. Entries that are literally `medium.com/...` URLs kept `source: 'Medium'`;
  everything else is `'Newsletter'`. Shows up automatically in the Toolbar's
  Source filter (`ARTICLE_SOURCE_OPTIONS`) — no component changes needed.
- **Per-focus mapping to the source repo's sections**:
  - `react-performance` ← that repo's *Frontend Development* section (+ a
    couple of JS-specific picks from *Language Specific*)
  - `frontend-system-design` ← *System Design & Architecture*
  - `typescript` ← *Language Specific* (the repo has no TypeScript-only
    subsection — it's JS/Python/Go/Rust newsletters generally; used the
    closest-fit ones)
  - `ai-coding-agents` ← *Data Science & AI* (this section is heavy on
    agent/AI-harness newsletters, so the fit here is strong)
  - `airtable-data-modeling` ← *Backend Development*, database/API-focused
    entries (DB Weekly, Engineering At Scale, API Developer Weekly, etc.) —
    a good real fit even though the repo has no "data modeling" section by
    that name
  - `accessibility` ← **honest gap**: the source repo has no accessibility
    (a11y/ARIA/WCAG) section at all. Used the closest available real
    newsletters — design systems, human-centered engineering, documentation
    — rather than either leaving it fabricated or force-fitting an unrelated
    newsletter as if it were accessibility-specific. Documented here instead
    of left silent, since it's the one focus where "real data" and "on-topic
    data" pull in different directions.
- **Verified**: every one of the 60 URLs checked for duplicates (`node -e`
  script counting `url:` occurrences — 60 unique, zero repeats across all
  six focuses) and for skipping the source repo's dead-end entries (its
  `duckduckgo.com/?q=...` fallback search links for newsletters it couldn't
  find a direct URL for, and rows marked "Description unavailable (Blocked
  by Cloudflare)"). Full typecheck/lint/test/build clean; manually verified
  in the browser that Fetch Suggestions returns 10 rows per focus and each
  row's URL opens the real newsletter.
- **What this doesn't change**: `POST /api/suggestions` is still a static
  lookup (see Phase 2 item 3 above) — clicking Fetch Suggestions for the
  same focus twice returns the same 10 newsletters both times. That's
  unchanged from before; only the *content* of the canned data moved from
  fictional to real.
- **Superseded by "Source is the site host" below**: the `'Newsletter'`
  `ArticleSource` category this section originally introduced didn't last —
  it was replaced the same day by deriving `source` from each row's own URL
  host, which is more precise (e.g. `"reactdevelopment.substack.com"` instead
  of the generic `"Newsletter"`) and applies uniformly everywhere, not just
  to this fixture. `RawSuggestion` no longer carries a `source` field at all.

## Source is the site host

**Status: ✅ Complete.** Requested: "when parsing for source, source should
be site host." Replaces the fixed `ArticleSource` enum (`'Hacker News' |
'DEV.to' | 'Medium' | 'Newsletter' | 'Manual'`) with a derived value.

- **`src/utils/siteHost.ts`** — new: `getSiteHost(url)` returns the URL's
  hostname stripped of a leading `www.`, or `null` for an empty/unparseable
  URL. Small and standalone so both `parseArticleInput` and (already)
  `deriveTitle`'s URL-slug fallback could use the same logic instead of each
  reimplementing `new URL(...).hostname` parsing.
- **`parseArticleInput.ts`** — `ParsedArticleFields` (and the server-side
  mirror, `ContentParserResult`) gained a `source` field: `getSiteHost(input.url) ?? 'Manual'`.
  Because this lives in the shared parser rather than in each route, both
  `POST /api/articles/parse` (manual entry) and `POST /api/suggestions`
  (fetch suggestions) get correct, consistent source derivation for free —
  neither route hardcodes or passes through a source value anymore; both
  just spread the parser's result. `MANUAL_SOURCE` (`'Manual'`) is exported
  so the one other place a source gets set without going through the parser
  — `useLearningTable`'s blank "+ Add row" payload, which has no URL yet —
  uses the same constant instead of a second magic string.
- **`ArticleSource` is now `type ArticleSource = string`**, not a closed
  union — hostnames are unbounded, so a fixed enum stopped making sense.
  `ARTICLE_SOURCE_OPTIONS` (the fixed 5-value list) is gone.
- **Toolbar's Source filter is now data-driven**, not enum-driven: `useLearningTable`
  computes `sourceOptions` as the sorted unique `source` values actually
  present in `rows` (`useMemo`, recomputed when rows change) and exposes it;
  `Toolbar`/`FilterSelect` render whatever's really in the table instead of
  a fixed list that could show options with zero matching rows or omit real
  ones. Add a row from a source never seen before and it appears in the
  filter immediately.
- **Seed data migrated for consistency**: `server/fixtures/learningRows.ts`'s
  18 rows previously used the old categorical labels (`'DEV.to'`, `'Hacker News'`,
  `'Medium'`, `'Manual'`); all updated to their actual URL hosts
  (`'dev.to'`, `'news.ycombinator.com'`, `'medium.com'`, `'x.com'`) so the
  seed data matches what the live parser would now produce for the same
  URLs. `server/fixtures/suggestionSources.ts`'s `RawSuggestion` interface
  dropped its `source` field entirely (60 fixture entries edited) since it's
  now always derived, never supplied.
- **Tests**: `siteHost.test.ts` (new — hostname extraction, `www.` stripping,
  subdomains preserved, null on empty/unparseable input), `parseArticleInput.test.ts`
  and `MockContentParser.test.ts` (source derivation + the `'Manual'` fallback),
  `articles.test.ts` and `suggestions.test.ts` (derivation verified through
  the actual HTTP routes, not just the unit), `useLearningTable.test.ts`
  (`sourceOptions` is the sorted unique set). 105 tests total (up from 91).
- **Verified**: full typecheck/lint/test/build, plus a manual Playwright
  walkthrough: pasting `https://css-tricks.com/some-article` into "Paste a
  Link or Note" produced a row with `source: "css-tricks.com"`; the Source
  filter dropdown listed exactly the real hostnames present in the table
  (`css-tricks.com`, `dev.to`, `medium.com`, `news.ycombinator.com`,
  `smashingmagazine.com`, `x.com`) and filtering by one correctly narrowed
  the table.

## Out of scope (future work, not built here)

**Offline daily RSS ingestion**: a scheduled job (cron/worker) pulls
configured RSS feeds daily, parses new entries through the same
`ContentParser` interface, and upserts into a "table of contents" store that
seeds/refreshes suggestions without the user clicking "Fetch". This requires
a real DB (dedupe on URL, track last-fetched-at) and a job runner, both of
which the repository/LLM abstractions above are already shaped to support —
no rework needed when this gets picked up, just a new repository
implementation and a scheduler entry point.

## Deliverables after implementation (per README)

1. Short summary of what was built
2. 3–5 minute walkthrough script
3. Tradeoffs and future improvements list
