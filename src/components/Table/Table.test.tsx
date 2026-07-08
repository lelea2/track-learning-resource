import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Table } from './Table';
import { makeRow } from '../../test/factories';

describe('Table', () => {
  it('renders the title as a clickable link to the article when a url is present', () => {
    const row = makeRow({ id: 'a', title: 'Some article', url: 'https://dev.to/foo/bar' });
    render(<Table rows={[row]} totalRowCount={1} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'Some article' });
    expect(link).toHaveAttribute('href', 'https://dev.to/foo/bar');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders the title as plain text when there is no url', () => {
    const row = makeRow({ id: 'a', title: 'No link yet', url: '' });
    render(<Table rows={[row]} totalRowCount={1} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={vi.fn()} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('No link yet')).toBeInTheDocument();
  });

  it('pins the title column so it stays visible during horizontal scroll', () => {
    const row = makeRow({ id: 'a', title: 'Sticky check', url: 'https://example.com/sticky' });
    render(<Table rows={[row]} totalRowCount={1} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={vi.fn()} />);

    const headerCell = screen.getByRole('columnheader', { name: 'Title' });
    expect(headerCell.className).toMatch(/sticky/);
    const link = screen.getByRole('link', { name: 'Sticky check' });
    expect(link.closest('td')?.className).toMatch(/sticky/);
  });

  it('edits both title and url from the combined cell on blur', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const row = makeRow({ id: 'a', title: 'Original title', url: 'https://example.com/original' });
    render(
      <Table rows={[row]} totalRowCount={1} onUpdate={onUpdate} onDelete={vi.fn()} onAddRow={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /edit title and url for/i }));

    const titleInput = screen.getByLabelText(/^Title for/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    const urlInput = screen.getByLabelText(/^URL for/i);
    await user.clear(urlInput);
    await user.type(urlInput, 'https://example.com/updated');

    await user.tab(); // leaves the cell, triggering the combined commit

    expect(onUpdate).toHaveBeenCalledWith('a', { title: 'Updated title' });
    expect(onUpdate).toHaveBeenCalledWith('a', { url: 'https://example.com/updated' });
  });

  it('discards edits on Escape', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const row = makeRow({ id: 'a', title: 'Keep me', url: 'https://example.com/keep' });
    render(
      <Table rows={[row]} totalRowCount={1} onUpdate={onUpdate} onDelete={vi.fn()} onAddRow={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /edit title and url for/i }));
    const titleInput = screen.getByLabelText(/^Title for/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Discarded');
    await user.keyboard('{Escape}');

    expect(screen.getByRole('link', { name: 'Keep me' })).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('commits a select change immediately', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const row = makeRow({ id: 'a', status: 'To Read' });
    render(
      <Table rows={[row]} totalRowCount={1} onUpdate={onUpdate} onDelete={vi.fn()} onAddRow={vi.fn()} />,
    );

    const select = screen.getByLabelText(/Status for/i);
    await user.selectOptions(select, 'Done');

    expect(onUpdate).toHaveBeenCalledWith('a', { status: 'Done' });
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const row = makeRow({ id: 'a', title: 'Removable row' });
    render(
      <Table rows={[row]} totalRowCount={1} onUpdate={vi.fn()} onDelete={onDelete} onAddRow={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /delete removable row/i }));
    expect(onDelete).toHaveBeenCalledWith('a');
  });

  it('calls onAddRow when "+ Add row" is clicked', async () => {
    const user = userEvent.setup();
    const onAddRow = vi.fn();
    render(<Table rows={[]} totalRowCount={0} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={onAddRow} />);

    await user.click(screen.getByRole('button', { name: /add row/i }));
    expect(onAddRow).toHaveBeenCalled();
  });

  it('shows an empty state distinguishing no rows from filtered-out rows', () => {
    const { rerender } = render(
      <Table rows={[]} totalRowCount={0} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={vi.fn()} />,
    );
    expect(screen.getByText(/fetch suggestions or paste a link/i)).toBeInTheDocument();

    rerender(
      <Table rows={[]} totalRowCount={5} onUpdate={vi.fn()} onDelete={vi.fn()} onAddRow={vi.fn()} />,
    );
    expect(screen.getByText(/no rows match the current filters/i)).toBeInTheDocument();
  });
});
