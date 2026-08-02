import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrokenAccessControlModule from './BrokenAccessControlModule';

async function openLab(user) {
  render(<BrokenAccessControlModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('BrokenAccessControlModule IDOR lab', () => {
  it('allows access to an owned invoice', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/1002/), '1002');
    await user.click(screen.getByRole('button', { name: /^fetch$/i }));
    expect(screen.getByText(/access allowed/i)).toBeInTheDocument();
  });

  it('flags access to someone else\'s invoice as IDOR and leaks their data', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/1002/), '2001');
    await user.click(screen.getByRole('button', { name: /^fetch$/i }));
    expect(screen.getByText(/accessed another user's invoice/i)).toBeInTheDocument();
    expect(screen.getByText(/jordan alvarez/i)).toBeInTheDocument();
  });
});
