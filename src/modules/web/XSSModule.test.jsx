import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import XSSModule from './XSSModule';

async function openLab(user) {
  render(<XSSModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('XSSModule lab', () => {
  it('identifies a <script> payload as reflected XSS and shows the escaped-safe output', async () => {
    const user = userEvent.setup();
    await openLab(user);
    const input = screen.getByPlaceholderText(/script.*alert/i);
    await user.type(input, "<script>alert('XSS')</script>");
    await user.click(screen.getByRole('button', { name: /^test$/i }));

    expect(screen.getByText(/direct script injection/i)).toBeInTheDocument();
    // The "secure" rendering path must escape the angle brackets.
    expect(screen.getByText(/&lt;script&gt;/i)).toBeInTheDocument();
  });

  it('does not flag plain text search input', async () => {
    const user = userEvent.setup();
    await openLab(user);
    const input = screen.getByPlaceholderText(/script.*alert/i);
    await user.type(input, 'red shoes');
    await user.click(screen.getByRole('button', { name: /^test$/i }));
    expect(screen.queryByText(/direct script injection/i)).not.toBeInTheDocument();
  });
});
