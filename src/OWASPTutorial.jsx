import React, { useState, useEffect, lazy, Suspense } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import colorClasses from './config/colorClasses';
import moduleConfigs from './config/moduleConfigs';

// Each module is a sizeable, self-contained lesson (learn/lab/quiz content).
// Lazy-loading keeps the initial bundle small -- a module's code only
// downloads when the learner actually opens it.
const SQLInjectionModule = lazy(() => import('./modules/web/SQLInjectionModule'));
const XSSModule = lazy(() => import('./modules/web/XSSModule'));
const BrokenAuthModule = lazy(() => import('./modules/web/BrokenAuthModule'));
const CSRFModule = lazy(() => import('./modules/web/CSRFModule'));
const PathTraversalModule = lazy(() => import('./modules/web/PathTraversalModule'));
const CommandInjectionModule = lazy(() => import('./modules/web/CommandInjectionModule'));
const DeserializationModule = lazy(() => import('./modules/web/DeserializationModule'));
const XXEModule = lazy(() => import('./modules/web/XXEModule'));
const SSRFModule = lazy(() => import('./modules/web/SSRFModule'));
const SecurityMisconfigModule = lazy(() => import('./modules/web/SecurityMisconfigModule'));
const SensitiveDataModule = lazy(() => import('./modules/web/SensitiveDataModule'));
const BrokenAccessControlModule = lazy(() => import('./modules/web/BrokenAccessControlModule'));
const VulnerableComponentsModule = lazy(() => import('./modules/web/VulnerableComponentsModule'));
const LoggingFailuresModule = lazy(() => import('./modules/web/LoggingFailuresModule'));
const PromptInjectionModule = lazy(() => import('./modules/llm/PromptInjectionModule'));
const LLMSensitiveInfoModule = lazy(() => import('./modules/llm/LLMSensitiveInfoModule'));
const LLMSupplyChainModule = lazy(() => import('./modules/llm/LLMSupplyChainModule'));
const DataPoisoningModule = lazy(() => import('./modules/llm/DataPoisoningModule'));
const OutputHandlingModule = lazy(() => import('./modules/llm/OutputHandlingModule'));
const ExcessiveAgencyModule = lazy(() => import('./modules/llm/ExcessiveAgencyModule'));
const SystemPromptLeakageModule = lazy(() => import('./modules/llm/SystemPromptLeakageModule'));
const VectorEmbeddingModule = lazy(() => import('./modules/llm/VectorEmbeddingModule'));
const MisinformationModule = lazy(() => import('./modules/llm/MisinformationModule'));
const UnboundedConsumptionModule = lazy(() => import('./modules/llm/UnboundedConsumptionModule'));

const ModuleLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-white text-lg animate-pulse">Loading module...</div>
  </div>
);

const OWASPSecurityTutorial = () => {
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('owasp-tutorial-progress');
    if (saved) {
      setModuleProgress(JSON.parse(saved));
    }
  }, []);

  const saveProgress = (moduleId, section) => {
    const newProgress = {
      ...moduleProgress,
      [moduleId]: {
        ...(moduleProgress[moduleId] || {}),
        [section]: true
      }
    };
    setModuleProgress(newProgress);
    localStorage.setItem('owasp-tutorial-progress', JSON.stringify(newProgress));
  };

  const getModuleCompletion = (moduleId) => {
    const progress = moduleProgress[moduleId] || {};
    const completed = Object.keys(progress).filter(k => progress[k]).length;
    return Math.round((completed / 3) * 100);
  };

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                OWASP Python & AI/ML Security Tutorial
              </h1>
            </div>
            <p className="text-xl text-slate-300">Interactive Learning Platform</p>
            <p className="text-slate-400 mt-2">Master web application AND AI/LLM application security by doing, not just reading</p>
          </div>

          {/* Module Grid - grouped by track */}
          {[
            { key: 'web', heading: '🐍 Python & Web Application Security', subheading: 'Classic OWASP Top 10 / CWE Top 25 - injection, auth, and infrastructure risks' },
            { key: 'llm', heading: '🤖 AI / LLM Application Security', subheading: "OWASP Top 10 for LLM Applications (2025) - risks specific to models, agents, and AI-integrated apps" }
          ].map(({ key, heading, subheading }) => (
            <div key={key} className="mb-10">
              <h2 className="text-2xl font-bold mb-1">{heading}</h2>
              <p className="text-slate-400 text-sm mb-4">{subheading}</p>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.values(moduleConfigs).filter(m => m.track === key).map((module) => {
                  const completion = getModuleCompletion(module.id);
                  const Icon = module.icon;

                  return (
                    <div
                      key={module.id}
                      onClick={() => setCurrentModule(module.id)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Icon className={`w-10 h-10 ${colorClasses[module.color].icon}`} />
                        {completion === 100 && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-2">{module.title}</h3>

                      <div className="flex gap-2 mb-3">
                        <span className={`px-2 py-1 border rounded-full text-xs ${colorClasses[module.color].badge}`}>
                          {module.owasp}
                        </span>
                        <span className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-full text-xs">
                          {module.cwe}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 mb-4">{module.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{completion}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>

                      <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-bold transition-all">
                        {completion > 0 ? 'Continue' : 'Start'} Module →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Stats */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="font-bold mb-4">Your Progress</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {Object.values(moduleConfigs).filter(m => getModuleCompletion(m.id) === 100).length}
                </div>
                <div className="text-sm text-slate-400">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">
                  {Object.values(moduleConfigs).filter(m => getModuleCompletion(m.id) > 0).length}
                </div>
                <div className="text-sm text-slate-400">Modules Started</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {Math.round(Object.values(moduleConfigs).reduce((sum, m) => sum + getModuleCompletion(m.id), 0) / Object.values(moduleConfigs).length)}%
                </div>
                <div className="text-sm text-slate-400">Overall Progress</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Open Source Security Education | Built for the Community</p>
            <p className="mt-2">⭐ Star on GitHub | 🤝 Contribute New Modules</p>
          </div>
        </div>
      </div>
    );
  }

  // Render specific module
  if (currentModule === 'sqlinjection') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <SQLInjectionModule
      onBack={() => setCurrentModule(null)} 
      onSectionComplete={(section) => saveProgress('sqlinjection', section)}
      completedSections={moduleProgress['sqlinjection'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'xss') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <XSSModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('xss', section)}
      completedSections={moduleProgress['xss'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'brokenauth') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <BrokenAuthModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('brokenauth', section)}
      completedSections={moduleProgress['brokenauth'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'csrf') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <CSRFModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('csrf', section)}
      completedSections={moduleProgress['csrf'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'pathtraversal') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <PathTraversalModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('pathtraversal', section)}
      completedSections={moduleProgress['pathtraversal'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'commandinjection') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <CommandInjectionModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('commandinjection', section)}
      completedSections={moduleProgress['commandinjection'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'deserialization') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <DeserializationModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('deserialization', section)}
      completedSections={moduleProgress['deserialization'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'xxe') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <XXEModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('xxe', section)}
      completedSections={moduleProgress['xxe'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'ssrf') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <SSRFModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('ssrf', section)}
      completedSections={moduleProgress['ssrf'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'secmisconfig') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <SecurityMisconfigModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('secmisconfig', section)}
      completedSections={moduleProgress['secmisconfig'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'sensitivedata') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <SensitiveDataModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('sensitivedata', section)}
      completedSections={moduleProgress['sensitivedata'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'brokenaccess') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <BrokenAccessControlModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('brokenaccess', section)}
      completedSections={moduleProgress['brokenaccess'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'vulncomponents') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <VulnerableComponentsModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('vulncomponents', section)}
      completedSections={moduleProgress['vulncomponents'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'loggingfailures') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <LoggingFailuresModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('loggingfailures', section)}
      completedSections={moduleProgress['loggingfailures'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'promptinjection') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <PromptInjectionModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('promptinjection', section)}
      completedSections={moduleProgress['promptinjection'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'llmsensitiveinfo') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <LLMSensitiveInfoModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('llmsensitiveinfo', section)}
      completedSections={moduleProgress['llmsensitiveinfo'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'llmsupplychain') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <LLMSupplyChainModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('llmsupplychain', section)}
      completedSections={moduleProgress['llmsupplychain'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'datapoisoning') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <DataPoisoningModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('datapoisoning', section)}
      completedSections={moduleProgress['datapoisoning'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'outputhandling') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <OutputHandlingModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('outputhandling', section)}
      completedSections={moduleProgress['outputhandling'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'excessiveagency') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <ExcessiveAgencyModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('excessiveagency', section)}
      completedSections={moduleProgress['excessiveagency'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'systempromptleakage') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <SystemPromptLeakageModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('systempromptleakage', section)}
      completedSections={moduleProgress['systempromptleakage'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'vectorembedding') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <VectorEmbeddingModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('vectorembedding', section)}
      completedSections={moduleProgress['vectorembedding'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'misinformation') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <MisinformationModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('misinformation', section)}
      completedSections={moduleProgress['misinformation'] || {}}
    />
      </Suspense>
    );
  } else if (currentModule === 'unboundedconsumption') {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <UnboundedConsumptionModule
      onBack={() => setCurrentModule(null)}
      onSectionComplete={(section) => saveProgress('unboundedconsumption', section)}
      completedSections={moduleProgress['unboundedconsumption'] || {}}
    />
      </Suspense>
    );
  }
};

export default OWASPSecurityTutorial;
