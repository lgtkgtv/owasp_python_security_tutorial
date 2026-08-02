import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrokenAuthModule from './BrokenAuthModule';

async function openLab(user) {
  render(<BrokenAuthModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('BrokenAuthModule session token lab', () => {
  it('flags a short sequential session token as weak', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/1001/), '1001');
    await user.click(screen.getByRole('button', { name: /inspect/i }));
    expect(screen.getByText(/weak session token detected/i)).toBeInTheDocument();
  });

  it('accepts a long high-entropy token as secure', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/1001/), 'xQz9K-vN8pR2mL4wH3jC6tY7fG1sD5bA9');
    await user.click(screen.getByRole('button', { name: /inspect/i }));
    expect(screen.getByText(/looks like a secure token/i)).toBeInTheDocument();
  });
});
