// Cross-module smoke test: every module in moduleConfigs must render, expose
// its title, and let a learner switch between Learn / Interactive Lab / Quiz
// tabs without throwing or logging a React error/warning. This is the
// regression net for future edits -- it would have caught the missing
// Trophy icon import that shipped in an earlier refactor pass.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moduleConfigs from '../config/moduleConfigs';

const webModules = import.meta.glob(['./web/*.jsx', '!./web/*.test.jsx'], { eager: true });
const llmModules = import.meta.glob(['./llm/*.jsx', '!./llm/*.test.jsx'], { eager: true });
const allModuleFiles = { ...webModules, ...llmModules };

function findComponent(componentFileNameNoExt) {
  const match = Object.entries(allModuleFiles).find(([path]) => path.endsWith(`/${componentFileNameNoExt}.jsx`));
  if (!match) throw new Error(`Could not find compiled module for ${componentFileNameNoExt}`);
  return match[1].default;
}

// Map each moduleConfigs id -> its exported component name (PascalCase file).
const idToComponentFile = {
  sqlinjection: 'SQLInjectionModule',
  xss: 'XSSModule',
  brokenauth: 'BrokenAuthModule',
  csrf: 'CSRFModule',
  pathtraversal: 'PathTraversalModule',
  commandinjection: 'CommandInjectionModule',
  deserialization: 'DeserializationModule',
  xxe: 'XXEModule',
  ssrf: 'SSRFModule',
  secmisconfig: 'SecurityMisconfigModule',
  sensitivedata: 'SensitiveDataModule',
  brokenaccess: 'BrokenAccessControlModule',
  vulncomponents: 'VulnerableComponentsModule',
  loggingfailures: 'LoggingFailuresModule',
  promptinjection: 'PromptInjectionModule',
  llmsensitiveinfo: 'LLMSensitiveInfoModule',
  llmsupplychain: 'LLMSupplyChainModule',
  datapoisoning: 'DataPoisoningModule',
  outputhandling: 'OutputHandlingModule',
  excessiveagency: 'ExcessiveAgencyModule',
  systempromptleakage: 'SystemPromptLeakageModule',
  vectorembedding: 'VectorEmbeddingModule',
  misinformation: 'MisinformationModule',
  unboundedconsumption: 'UnboundedConsumptionModule',
};

afterEach(() => cleanup());

describe.each(Object.entries(moduleConfigs))('%s module', (id, config) => {
  it(`renders "${config.title}" and cycles through all three tabs cleanly`, async () => {
    const componentFile = idToComponentFile[id];
    expect(componentFile, `no component mapping for module id "${id}"`).toBeDefined();
    const Component = findComponent(componentFile);

    const errors = [];
    const origError = console.error;
    console.error = (...args) => { errors.push(args.join(' ')); };

    const onBack = vi.fn();
    const onSectionComplete = vi.fn();

    const user = userEvent.setup();
    render(
      <Component onBack={onBack} onSectionComplete={onSectionComplete} completedSections={{}} />
    );

    // Title appears at least once (heading or tab content)
    expect(screen.getAllByText(config.title).length).toBeGreaterThan(0);

    // Interactive Lab tab
    await user.click(screen.getByRole('button', { name: /^interactive lab$/i }));
    expect(screen.getAllByText(config.title).length).toBeGreaterThan(0);

    // Quiz tab
    await user.click(screen.getByRole('button', { name: /^quiz$/i }));
    expect(screen.getByText(/knowledge check quiz/i)).toBeInTheDocument();

    // Back button wired up
    const backBtn = screen.queryByRole('button', { name: /back to modules/i });
    if (backBtn) {
      await user.click(backBtn);
      expect(onBack).toHaveBeenCalled();
    }

    console.error = origError;
    expect(errors, `console.error calls while rendering ${config.title}: ${errors.join('\n')}`).toHaveLength(0);
  });
});
