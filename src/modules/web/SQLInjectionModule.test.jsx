import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SQLInjectionModule from './SQLInjectionModule';

async function openLab(user) {
  render(
    <SQLInjectionModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />
  );
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('SQLInjectionModule lab', () => {
  it('flags a classic OR 1=1 authentication bypass', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/admin/i), "admin' OR '1'='1");
    await user.click(screen.getByRole('button', { name: /execute query/i }));
    expect(screen.getByText(/sql injection detected/i)).toBeInTheDocument();
    expect(screen.getByText(/authentication bypassed/i)).toBeInTheDocument();
  });

  it('does not flag a normal username', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/admin/i), 'alice');
    await user.click(screen.getByRole('button', { name: /execute query/i }));
    expect(screen.queryByText(/sql injection detected/i)).not.toBeInTheDocument();
  });
});
