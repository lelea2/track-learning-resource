import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ProgressChart } from './ProgressChart';
import type { DailyProgress } from '../../utils/progressOverTime';

function makeDaily(overrides: Partial<DailyProgress>[] = []): DailyProgress[] {
  const days: DailyProgress[] = Array.from({ length: 14 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    completed: 0,
    progressed: 0,
  }));
  overrides.forEach((override, i) => {
    days[i] = { ...days[i], ...override };
  });
  return days;
}

describe('ProgressChart', () => {
  it('shows an empty state when there is no activity', () => {
    render(<ProgressChart dailyProgress={makeDaily()} />);
    expect(screen.getByText(/no status changes in the last 14 days/i)).toBeInTheDocument();
  });

  it('renders a legend with totals when there is activity', () => {
    const data = makeDaily([{ completed: 2 }, {}, { progressed: 1 }]);
    render(<ProgressChart dailyProgress={data} />);
    expect(screen.getByText(/completed \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/progressed \(1\)/i)).toBeInTheDocument();
  });

  it('renders one interactive bar per day', () => {
    const data = makeDaily([{ completed: 1 }]);
    render(<ProgressChart dailyProgress={data} />);
    expect(screen.getAllByRole('button')).toHaveLength(14);
  });

  it('shows a tooltip with exact counts on hover', async () => {
    const user = userEvent.setup();
    const data = makeDaily([{ completed: 3, progressed: 2 }]);
    render(<ProgressChart dailyProgress={data} />);

    await user.hover(screen.getAllByRole('button')[0]);

    expect(screen.getByText('3 completed')).toBeInTheDocument();
    expect(screen.getByText('2 progressed')).toBeInTheDocument();
  });

  it('exposes an accessible data table with every day', () => {
    const data = makeDaily([{ completed: 1 }]);
    render(<ProgressChart dailyProgress={data} />);

    const table = screen.getByRole('table', { hidden: true });
    expect(table.querySelectorAll('tbody tr')).toHaveLength(14);
  });
});
