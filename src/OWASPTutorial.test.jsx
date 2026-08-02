import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OWASPSecurityTutorial from './OWASPTutorial';
import moduleConfigs from './config/moduleConfigs';

function findModuleCard(title) {
  const heading = screen.getByText(title);
  let card = heading.closest('div');
  while (card && !card.querySelector('button')) {
    card = card.parentElement;
  }
  return card;
}

beforeEach(() => {
  localStorage.clear();
});

describe('OWASPSecurityTutorial (home + navigation)', () => {
  it('renders the home page with both track headings and every module card', () => {
    render(<OWASPSecurityTutorial />);
    expect(screen.getByText(/Python & Web Application Security/i)).toBeInTheDocument();
    expect(screen.getByText(/AI \/ LLM Application Security/i)).toBeInTheDocument();

    for (const mod of Object.values(moduleConfigs)) {
      expect(screen.getByText(mod.title)).toBeInTheDocument();
    }
  });

  it('opens a module when its card is clicked, and returns home via Back to Modules', async () => {
    const user = userEvent.setup();
    render(<OWASPSecurityTutorial />);

    const card = findModuleCard('SQL Injection (SQLi)');
    await user.click(within(card).getByRole('button', { name: /start module/i }));

    // module is code-split/lazy -- wait for it to appear
    expect(await screen.findByRole('button', { name: /back to modules/i }, { timeout: 2000 })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to modules/i }));
    expect(await screen.findByText(/Python & Web Application Security/i)).toBeInTheDocument();
  });

  it('persists section completion to localStorage and reflects it as progress on return', async () => {
    const user = userEvent.setup();
    render(<OWASPSecurityTutorial />);

    const card = findModuleCard('SQL Injection (SQLi)');
    await user.click(within(card).getByRole('button', { name: /start module/i }));

    await screen.findByRole('button', { name: /back to modules/i }, { timeout: 2000 });
    await user.click(screen.getByRole('button', { name: /^learn$/i }));
    // Learn tab has a "continue" CTA that marks the learn section complete
    const continueBtn = await screen.findByRole('button', { name: /continue to interactive lab/i });
    await user.click(continueBtn);

    const stored = JSON.parse(localStorage.getItem('owasp-tutorial-progress'));
    expect(stored.sqlinjection.learn).toBe(true);

    await user.click(screen.getByRole('button', { name: /back to modules/i }));
    await screen.findByText(/Python & Web Application Security/i);
    // Progress bar for the module should now read something above 0%.
    const sqlCard = findModuleCard('SQL Injection (SQLi)');
    expect(within(sqlCard).getByText('33%')).toBeInTheDocument();
  });
});
