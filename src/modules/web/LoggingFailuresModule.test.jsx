import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoggingFailuresModule from './LoggingFailuresModule';

async function openLab(user) {
  render(<LoggingFailuresModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('LoggingFailuresModule log-review lab', () => {
  it('flags a log line that leaks a raw password', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/login_attempt/i), 'login_attempt username=admin password=hunter2');
    await user.click(screen.getByRole('button', { name: /^review$/i }));
    expect(screen.getByText(/sensitive data logged/i)).toBeInTheDocument();
  });

  it('approves a well-formed security event log', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(
      screen.getByPlaceholderText(/login_attempt/i),
      'login_failed user_id=42 reason=invalid_password ip=203.0.113.7'
    );
    await user.click(screen.getByRole('button', { name: /^review$/i }));
    expect(screen.getByText(/properly logged security event/i)).toBeInTheDocument();
  });

  it('flags a generic request log with no security signal', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/login_attempt/i), 'GET /health 200 12ms');
    await user.click(screen.getByRole('button', { name: /^review$/i }));
    expect(screen.getByText(/no security event logged/i)).toBeInTheDocument();
  });
});
