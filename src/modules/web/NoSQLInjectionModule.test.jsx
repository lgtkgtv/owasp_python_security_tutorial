import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoSQLInjectionModule from './NoSQLInjectionModule';

async function openLab(user) {
  render(<NoSQLInjectionModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

async function attemptLogin(user, password) {
  const input = screen.getByPlaceholderText(/\$ne/);
  const escaped = password.replace(/\{/g, '{{').replace(/\}/g, '}}');
  await user.clear(input);
  await user.type(input, escaped);
  await user.click(screen.getByRole('button', { name: /attempt login/i }));
}

describe('NoSQLInjectionModule lab', () => {
  it('authenticates normally with the correct password', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await attemptLogin(user, 'secret123');
    expect(screen.getByText(/^✅ Correct password/i)).toBeInTheDocument();
  });

  it('rejects an incorrect plain-string password', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await attemptLogin(user, 'wrongpassword');
    expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
  });

  it('flags a $ne operator payload as a NoSQL injection authentication bypass', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await attemptLogin(user, '{"$ne": null}');
    expect(screen.getByText(/nosql injection detected/i)).toBeInTheDocument();
    expect(screen.getByText(/authentication bypassed/i)).toBeInTheDocument();
    expect(screen.getByText(/authenticated: true/i)).toBeInTheDocument();
  });

  it('flags a $regex operator payload as a bypass too', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await attemptLogin(user, '{"$regex": ".*"}');
    expect(screen.getByText(/bypassed via regex/i)).toBeInTheDocument();
  });
});
