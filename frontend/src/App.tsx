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
import { TenSecondAILoader } from './components/ui/Loader';

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
    year: 2026,
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
    // Clear all workspace states on signout
    setPrediction(null);
    setExplainData(null);
    setSensData(null);
    setWhatIfData(null);
    setInputData({
      country: options?.countries[0] || 'India',
      crop: options?.crops[0] || 'Wheat',
      rainfall_mm: 1050,
      avg_temp_c: 25.5,
      pesticides_tonnes: 50000,
      year: 2026
    });
  };

  // Actions
  const handleRunPrediction = async () => {
    setLoadingPred(true);
    try {
      const [res] = await Promise.all([
        api.predictYield(inputData),
        new Promise((resolve) => setTimeout(resolve, 10000))
      ]);
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
      const [res] = await Promise.all([
        api.fetchExplanation(inputData),
        new Promise((resolve) => setTimeout(resolve, 10000))
      ]);
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
      const [res] = await Promise.all([
        api.runSensitivity(inputData, sensParam),
        new Promise((resolve) => setTimeout(resolve, 850))
      ]);
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
      const [res] = await Promise.all([
        api.runWhatIf(scenarios),
        new Promise((resolve) => setTimeout(resolve, 850))
      ]);
      setWhatIfData(res);
    } catch (err: any) {
      alert(err.message || 'What-if simulation failed');
    } finally {
      setLoadingWhatIf(false);
    }
  };

    const handleClearPrediction = () => {
    setPrediction(null);
    setInputData({
      country: options?.countries[0] || 'India',
      crop: options?.crops[0] || 'Wheat',
      rainfall_mm: 1050,
      avg_temp_c: 25.5,
      pesticides_tonnes: 50000,
      year: 2026
    });
  };

  const handleClearExplain = () => {
    setExplainData(null);
  };

  const handleClearSensitivity = () => {
    setSensData(null);
  };

  const handleClearWhatIf = () => {
    setWhatIfData(null);
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
          />

          <main className="app-view-body">
            <div style={{ display: activeTab === 'overview' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <OverviewTab
                currentUser={currentUser}
                onNavigate={(tab: any) => setActiveTab(tab)}
              />
            </div>

            <div style={{ display: activeTab === 'predict' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <PredictionTab
                inputData={inputData}
                setInputData={setInputData}
                options={options}
                prediction={prediction}
                loading={loadingPred}
                onRunPrediction={handleRunPrediction}
                onClearPrediction={handleClearPrediction}
                onNavigateToExplain={() => { setActiveTab('explain'); if (!explainData) handleRunExplain(); }}
                onNavigateToWhatIf={() => { setActiveTab('whatif'); if (!whatIfData) handleRunWhatIf(); }}
              />
            </div>

            <div style={{ display: activeTab === 'batch' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <BatchPredictionTab />
            </div>

            <div style={{ display: activeTab === 'explain' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <ExplainTab
                explainData={explainData}
                loading={loadingExplain}
                onRunExplain={handleRunExplain}
                onClearExplain={handleClearExplain}
              />
            </div>

            <div style={{ display: activeTab === 'sensitivity' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <SensitivityTab
                sensData={sensData}
                sensParam={sensParam}
                setSensParam={setSensParam}
                loading={loadingSens}
                onRunSensitivity={handleRunSensitivity}
                onClearSensitivity={handleClearSensitivity}
              />
            </div>

            <div style={{ display: activeTab === 'whatif' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <WhatIfTab
                inputData={inputData}
                whatIfData={whatIfData}
                loading={loadingWhatIf}
                onRunWhatIf={handleRunWhatIf}
                onClearWhatIf={handleClearWhatIf}
              />
            </div>

            <div style={{ display: activeTab === 'benchmarks' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <BenchmarksTab benchmarks={benchmarks} />
            </div>

            <div style={{ display: activeTab === 'history' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
              <HistoryTab onNavigateToPredict={() => setActiveTab('predict')} />
            </div>
          </main>
        </div>

        {/* Centered 10-Second Countdown AI Loaders */}
        {loadingPred && (
          <TenSecondAILoader 
            title="Terraflect Inference Pipeline"
            subtitle={`Calibrating 2026 climate tensors & conformal bounds for ${inputData.country} (${inputData.crop})...`}
          />
        )}
        {loadingExplain && (
          <TenSecondAILoader 
            title="TreeSHAP Attribution Pass"
            subtitle={`Computing exact Shapley factor contributions for ${inputData.country} (${inputData.crop})...`}
          />
        )}
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
