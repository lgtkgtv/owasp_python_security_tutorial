import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VulnerableComponentsModule from './VulnerableComponentsModule';

async function openLab(user) {
  render(<VulnerableComponentsModule onBack={vi.fn()} onSectionComplete={vi.fn()} completedSections={{}} />);
  await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
}

describe('VulnerableComponentsModule dependency-check lab', () => {
  it('flags a known-vulnerable pinned version', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/pyyaml==5.3.1/), 'pyyaml==5.3.1');
    await user.click(screen.getByRole('button', { name: /^check$/i }));
    expect(screen.getByText(/known-vulnerable version/i)).toBeInTheDocument();
  });

  it('accepts a patched version', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/pyyaml==5.3.1/), 'pyyaml==6.0.1');
    await user.click(screen.getByRole('button', { name: /^check$/i }));
    expect(screen.getByText(/✅ Patched Version:/i)).toBeInTheDocument();
  });

  it('flags an unpinned dependency', async () => {
    const user = userEvent.setup();
    await openLab(user);
    await user.type(screen.getByPlaceholderText(/pyyaml==5.3.1/), 'requests');
    await user.click(screen.getByRole('button', { name: /^check$/i }));
    expect(screen.getByText(/unpinned dependency/i)).toBeInTheDocument();
  });
});
