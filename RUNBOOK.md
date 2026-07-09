# Runbook — AI Learning Radar

Current state: **Phase 2 substantially complete** — React frontend backed by
a real Express server. In-memory storage, deterministic mock "AI" parsing.
No external API keys needed to run it (see [BUILD_PLAN.md](BUILD_PLAN.md) for
what's still deferred: real HN/DEV.to/Medium calls and OpenAI).

## Prerequisites

- Node.js 20+ (developed and verified on Node 26)
- npm 10+

## Install

```bash
npm install
```

## Run the app

Two processes: the Vite dev server (client) and the Express API (server).

```bash
npm run dev:all
```

Runs both together (`concurrently`), labeled `web`/`server` in the output.
Client on `http://localhost:5173` (or the next free port — check the
terminal), server on `http://localhost:3001`. The client's dev server proxies
`/api/*` to the server automatically (`vite.config.ts`) — open the client URL,
not the server's.

To run them separately (e.g. two terminals):

```bash
npm run dev       # client only
npm run server    # server only, tsx watch mode
```

If you change the server's port, set `SERVER_PORT` for **both** processes so
the proxy target matches:

```bash
SERVER_PORT=4000 npm run dev:all
```

No `.env` file or API keys are required — everything defaults to in-memory
storage and mock parsing (see `.env.example` for the optional overrides).

## Run tests

```bash
npm run test          # single run (CI mode)
npm run test:watch    # watch mode while developing
```

91 tests: 67 client-side (deterministic parsing/sorting/filtering/study-plan/
metrics/progress utils, the `useLearningTable` hook including async init +
optimistic CRUD + mocked fetch/parse success/error paths, and Table/ProgressChart
component interactions) + 24 server-side (`InMemoryArticleRepository`,
`MockContentParser`, and both route files via `supertest` — status codes,
404s, 400s, and the simulated-502 failure path).

## Typecheck, lint, build

```bash
npx tsc -b --noEmit   # typechecks client + server project references
npm run lint           # eslint (covers src/ and server/)
npm run build          # typecheck + production build to dist/ (client only)
npm run preview        # serve the production build locally
```

`npm run build` only builds the client (`vite build`); the server runs via
`tsx` directly, there's no separate server build step at this stage. All
commands above should run clean on a fresh checkout.

## Walking through the app

1. **Metrics bar** (top) — total articles, To Read, Completed, High priority,
   today's study minutes. Recomputed live from table state.
2. **Today's Study Plan** — auto-picks 1 high-priority row, 1 practical
   coding row, 1 leadership/system-design row. Updates as rows change.
3. **Study Progress — Last 14 Days** — a stacked column chart of daily
   Completed (emerald) vs. Progressed (amber) counts, based on each row's
   `statusUpdatedAt`. Hover or focus a bar for exact counts; change any
   row's Status and watch *today's* bar update live, no reload needed (it's
   also persisted — refresh and it's still there). Empty state shown if
   nothing's changed status in the window.
4. **Fetch Suggestions** — pick a learning focus, click the button. The
   server simulates a ~0.5-0.9s upstream call and returns 10 parsed rows for
   that focus, already persisted server-side. The canned per-focus data is
   real newsletters pulled from the
   [awesome-tech-newsletter](https://github.com/Infrasity-Labs/awesome-tech-newsletter)
   directory (real names, real links — see `server/fixtures/suggestionSources.ts`),
   not a live API call. Fails ~12% of the time on purpose (shows the error
   banner + Retry button) — deliberate, not a real bug; click Retry or Fetch again.
5. **Paste a Link or Note** — paste a URL or free text, click "Add to table".
   Hits `POST /api/articles/parse`, which runs the same deterministic mock
   parser (`src/utils/parseArticleInput.ts`, wrapped server-side by
   `MockContentParser`) that backs Fetch Suggestions, then persists the row.
6. **Toolbar** — live search by title, filter by status/topic/difficulty/
   priority/source, sort by priority/topic/estimated time (click the
   direction toggle to flip asc/desc). All client-side over whatever rows
   are currently loaded — no server round-trip per filter/sort change.
7. **Table** — click any text/number cell to edit inline (Enter commits,
   Escape cancels, blur commits); selects (Topic/Difficulty/Priority/Status)
   commit on change. Title and URL are one sticky column (stays pinned
   during horizontal scroll): title renders as a clickable link (opens in a
   new tab) using the row's URL as href; click the pencil icon to edit both
   title and URL together. "+ Add row" inserts a blank editable row;
   "Delete" removes a row. All edits/adds/deletes sync to the server in the
   background (optimistic — the UI updates immediately, no spinner) and
   **survive a page reload** — try it: edit a title, refresh, it's still there.

## Project structure quick reference

```
src/
  types/        data model (LearningRow, StudyPlan, etc.)
  utils/        pure functions: filtering, sorting, topic inference,
                priority scoring, mock content parser, study plan, metrics,
                progress-over-time bucketing
                (shared with server/ via relative import — see BUILD_PLAN.md)
  api/          client.ts (fetch wrapper) + articles.ts / suggestions.ts —
                real HTTP calls to the Express server over /api/*
  state/        useLearningTable — fetches on mount, owns all table state
  components/   Table, Toolbar, FetchSuggestions, ManualEntry,
                StudyPlanPanel, ProgressChart, MetricsBar

server/
  index.ts       createApp() + listen()
  config.ts      DB_PROVIDER / LLM_PROVIDER factories (memory/mock only — see BUILD_PLAN.md)
  routes/        articles.ts, suggestions.ts
  repository/    ArticleRepository interface + InMemoryArticleRepository
  llm/           ContentParser interface + MockContentParser
  fixtures/      seed data + canned suggestion sources (server-side only,
                not shipped to the client bundle)
  utils/         simulateLatency.ts — the ~500-900ms/~12%-failure simulation,
                applied only to the two endpoints that stand in for a real
                upstream call
```

See [BUILD_PLAN.md](BUILD_PLAN.md) for the full architecture, what's
deferred (real external API calls, OpenAI, SQL repository), and what's
explicitly out of scope (offline daily RSS ingestion).

## Known non-bugs

- **Fetch Suggestions occasionally errors.** Intentional — simulates real
  network flakiness so the loading/error UI is exercised, not decorative.
  ~12% failure rate, defined in `server/utils/simulateLatency.ts` (`ERROR_RATE`).
- **"Fetch Suggestions" returns the same 10 newsletters every time for a
  given focus.** Intentional for this pass — the data is real (genuine
  newsletters with real links, from
  [awesome-tech-newsletter](https://github.com/Infrasity-Labs/awesome-tech-newsletter))
  but statically bundled, not a live API call. See BUILD_PLAN.md Phase 2,
  item 3, and "Real newsletter suggestion data."
- **State resets if the server process restarts.** The repository is an
  in-memory `Map` — expected until a real DB backs it (BUILD_PLAN.md's
  `SqlArticleRepository` swap point). Restarting only the client (Vite) does
  *not* lose data; only killing the server process does.
