import { useLearningTable } from './state/useLearningTable';
import { Table } from './components/Table/Table';
import { Toolbar } from './components/Toolbar/Toolbar';
// import { FetchSuggestionsPanel } from './components/FetchSuggestions/FetchSuggestionsPanel';
import { ManualEntryForm } from './components/ManualEntry/ManualEntryForm';
import { StudyPlanPanel } from './components/StudyPlanPanel/StudyPlanPanel';
import { MetricsBar } from './components/MetricsBar/MetricsBar';
import { ProgressChart } from './components/ProgressChart/ProgressChart';
import { ToastStack } from './components/Toast/ToastStack';

function App() {
  const {
    rows,
    visibleRows,
    filters,
    sort,
    studyPlan,
    metrics,
    dailyProgress,
    sourceOptions,
    initStatus,
    initError,
    // fetchStatus,
    // fetchError,
    parseStatus,
    parseError,
    toasts,
    addBlankRow,
    updateRow,
    deleteRow,
    setFilters,
    setSort,
    // fetchSuggestionsForFocus,
    submitManualEntry,
    dismissToast,
    retryInit,
  } = useLearningTable();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Learning Radar</h1>
        <p className="text-sm text-slate-500">
          Turn scattered learning links into a structured, sortable study tracker.
        </p>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5">
        {initStatus === 'loading' && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            Loading your table…
          </div>
        )}

        {initStatus === 'error' && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-10 text-center text-sm text-rose-700">
            {initError ?? 'Could not load your table.'}{' '}
            <button
              type="button"
              onClick={retryInit}
              className="font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {initStatus === 'idle' && (
          <>
            <MetricsBar metrics={metrics} />

            <StudyPlanPanel studyPlan={studyPlan} />

            <ProgressChart dailyProgress={dailyProgress} />

            {/* <FetchSuggestionsPanel
              status={fetchStatus}
              error={fetchError}
              onFetch={fetchSuggestionsForFocus}
            /> */}
            <ManualEntryForm
              status={parseStatus}
              error={parseError}
              onSubmit={submitManualEntry}
            />

            <Toolbar
              filters={filters}
              sort={sort}
              visibleCount={visibleRows.length}
              totalCount={rows.length}
              sourceOptions={sourceOptions}
              onFiltersChange={setFilters}
              onSortChange={setSort}
            />

            <Table
              rows={visibleRows}
              totalRowCount={rows.length}
              onUpdate={updateRow}
              onDelete={deleteRow}
              onAddRow={addBlankRow}
            />
          </>
        )}
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
