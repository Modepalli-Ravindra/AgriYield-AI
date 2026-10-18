import { useState, useEffect } from 'react';
import { FloatingNavbar } from './components/landing/FloatingNavbar';
import { HeroSection } from './components/landing/HeroSection';
import { ProjectOverview } from './components/landing/ProjectOverview';
import { BentoGrid } from './components/landing/BentoGrid';
import { FrameworkPipeline } from './components/landing/FrameworkPipeline';
import { ModelMethodology } from './components/landing/ModelMethodology';
import { EnvironmentalContext } from './components/landing/EnvironmentalContext';
import { TrustFaqFooter } from './components/landing/TrustFaqFooter';

import { AuthModal } from './components/auth/AuthModal';
import { AppSidebar } from './components/dashboard/AppSidebar';
import { AppHeader } from './components/dashboard/AppHeader';

import { OverviewTab } from './components/dashboard/OverviewTab';
import { PredictionTab } from './components/dashboard/PredictionTab';
import { BatchPredictionTab } from './components/dashboard/BatchPredictionTab';
import { ExplainTab } from './components/dashboard/ExplainTab';
import { SensitivityTab } from './components/dashboard/SensitivityTab';
import { WhatIfTab } from './components/dashboard/WhatIfTab';
import { BenchmarksTab } from './components/dashboard/BenchmarksTab';
import { HistoryTab } from './components/dashboard/HistoryTab';

import type { 
  YieldInput, 
  PredictionResponse, 
  OptionsResponse, 
  ExplainResponse, 
  SensitivityResponse, 
  WhatIfResponse, 
  ModelComparisonResponse, 
  UserProfile 
} from './types';
import * as api from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'predict' | 'batch' | 'explain' | 'sensitivity' | 'whatif' | 'benchmarks' | 'history'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Shared prediction data state
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [inputData, setInputData] = useState<YieldInput>({
    country: 'India',
    crop: 'Wheat',
    year: 2013,
    rainfall_mm: 1050.0,
    avg_temp_c: 25.5,
    pesticides_tonnes: 50000.0
  });
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loadingPred, setLoadingPred] = useState(false);

  // Analytical tool states
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const [sensParam, setSensParam] = useState('rainfall_mm');
  const [sensData, setSensData] = useState<SensitivityResponse | null>(null);
  const [loadingSens, setLoadingSens] = useState(false);

  const [whatIfData, setWhatIfData] = useState<WhatIfResponse | null>(null);
  const [loadingWhatIf, setLoadingWhatIf] = useState(false);

  const [benchmarks, setBenchmarks] = useState<ModelComparisonResponse | null>(null);

  // Initialize
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user && localStorage.getItem('access_token')) {
      setCurrentUser(user);
      // Auto-route authenticated users directly to dashboard
      setView('app');
    }

    api.fetchOptions().then(opts => {
      setOptions(opts);
      if (opts.default_input) setInputData(opts.default_input);
    }).catch(console.error);

    api.fetchModelBenchmarks().then(setBenchmarks).catch(console.error);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    setView('app');
  };

  const handleLogout = () => {
    api.logoutUser();
    setCurrentUser(null);
    setView('landing');
  };

  // Actions
  const handleRunPrediction = async () => {
    setLoadingPred(true);
    try {
      const res = await api.predictYield(inputData);
      setPrediction(res);
    } catch (err: any) {
      alert(err.message || 'Prediction failed');
    } finally {
      setLoadingPred(false);
    }
  };

  const handleRunExplain = async () => {
    setLoadingExplain(true);
    try {
      const res = await api.fetchExplanation(inputData);
      setExplainData(res);
    } catch (err: any) {
      alert(err.message || 'Explanation failed');
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleRunSensitivity = async () => {
    setLoadingSens(true);
    try {
      const res = await api.runSensitivity(inputData, sensParam);
      setSensData(res);
    } catch (err: any) {
      alert(err.message || 'Sensitivity analysis failed');
    } finally {
      setLoadingSens(false);
    }
  };

  const handleRunWhatIf = async () => {
    setLoadingWhatIf(true);
    try {
      const scenarios = [
        {
          scenario_name: 'Current Baseline',
          inputs: { ...inputData }
        },
        {
          scenario_name: 'Climate Stress (+2.5°C Heatwave)',
          inputs: { ...inputData, avg_temp_c: inputData.avg_temp_c + 2.5 }
        },
        {
          scenario_name: 'Drought Shock (-30% Rainfall)',
          inputs: { ...inputData, rainfall_mm: Math.max(50, inputData.rainfall_mm * 0.7) }
        },
        {
          scenario_name: 'Optimal Moisture (+20% Rainfall)',
          inputs: { ...inputData, rainfall_mm: inputData.rainfall_mm * 1.2 }
        }
      ];
      const res = await api.runWhatIf(scenarios);
      setWhatIfData(res);
    } catch (err: any) {
      alert(err.message || 'What-if simulation failed');
    } finally {
      setLoadingWhatIf(false);
    }
  };

  // If user is authenticated and in the 'app' view: render the Authenticated Workspace Shell
  if (view === 'app' && currentUser) {
    const getTabMeta = () => {
      switch (activeTab) {
        case 'overview':
          return { title: 'System Overview & Workspace', subtitle: 'Live model telemetry and verified evaluation metrics' };
        case 'predict':
          return { title: 'Crop Yield Prediction', subtitle: 'Point inference with nominal 90% conformal uncertainty intervals' };
        case 'batch':
          return { title: 'Batch Scenario Processing', subtitle: 'Simulate up to 50 concurrent agricultural scenarios' };
        case 'explain':
          return { title: 'TreeSHAP Feature Attribution', subtitle: 'Exact game-theoretic local feature contributions' };
        case 'sensitivity':
          return { title: 'Climate Sensitivity Analysis', subtitle: 'Parameter response curves across [-30%, +30%] variation' };
        case 'whatif':
          return { title: 'What-If Climate Simulator', subtitle: 'Evaluate counterfactual environmental shifts against baseline' };
        case 'benchmarks':
          return { title: 'Model Benchmarks & Global Importance', subtitle: 'Empirical multi-architecture comparison and Gini gain' };
        case 'history':
          return { title: 'Prediction Audit History', subtitle: 'User-isolated query history stored securely with encrypted exports' };
        default:
          return { title: 'Workspace', subtitle: 'Terraflect Platform' };
      }
    };

    const { title, subtitle } = getTabMeta();

    return (
      <div className="app-shell">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="app-main-content">
          <AppHeader
            title={title}
            subtitle={subtitle}
            currentUser={currentUser}
            onLogout={handleLogout}
            onBackToLanding={() => setView('landing')}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <main className="app-view-body">
            {activeTab === 'overview' && (
              <OverviewTab
                currentUser={currentUser}
                onNavigate={(tab: any) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'predict' && (
              <PredictionTab
                inputData={inputData}
                setInputData={setInputData}
                options={options}
                prediction={prediction}
                loading={loadingPred}
                onRunPrediction={handleRunPrediction}
                onNavigateToExplain={() => { setActiveTab('explain'); handleRunExplain(); }}
                onNavigateToWhatIf={() => { setActiveTab('whatif'); handleRunWhatIf(); }}
              />
            )}
            {activeTab === 'batch' && <BatchPredictionTab />}
            {activeTab === 'explain' && (
              <ExplainTab
                explainData={explainData}
                loading={loadingExplain}
                onRunExplain={handleRunExplain}
              />
            )}
            {activeTab === 'sensitivity' && (
              <SensitivityTab
                sensData={sensData}
                sensParam={sensParam}
                setSensParam={setSensParam}
                loading={loadingSens}
                onRunSensitivity={handleRunSensitivity}
              />
            )}
            {activeTab === 'whatif' && (
              <WhatIfTab
                inputData={inputData}
                whatIfData={whatIfData}
                loading={loadingWhatIf}
                onRunWhatIf={handleRunWhatIf}
              />
            )}
            {activeTab === 'benchmarks' && <BenchmarksTab benchmarks={benchmarks} />}
            {activeTab === 'history' && <HistoryTab onNavigateToPredict={() => setActiveTab('predict')} />}
          </main>
        </div>
      </div>
    );
  }

  // Otherwise: render Public Landing Page
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <FloatingNavbar onOpenAuth={handleOpenAuth} />

      <HeroSection 
        onGetStarted={() => handleOpenAuth('register')}
        onExploreMethodology={() => {
          const el = document.getElementById('methodology');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ProjectOverview />
      <BentoGrid />
      <FrameworkPipeline />
      <ModelMethodology />
      <EnvironmentalContext />
      <TrustFaqFooter onGetStarted={() => handleOpenAuth('register')} />

      {authModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
