import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  GitCompare, 
  LineChart, 
  ShieldCheck, 
  Cpu, 
  History, 
  LogIn, 
  LogOut, 
  Sparkles, 
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as RLineChart, 
  Line, 
  BarChart as RBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  Cell 
} from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'predict' | 'whatif' | 'sensitivity' | 'explain' | 'benchmarks' | 'robustness' | 'history'>('overview');
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authOrg, setAuthOrg] = useState('');
  const [authError, setAuthError] = useState('');

  // Prediction State
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

  // Sensitivity State
  const [sensParam, setSensParam] = useState('rainfall_mm');
  const [sensData, setSensData] = useState<SensitivityResponse | null>(null);
  const [loadingSens, setLoadingSens] = useState(false);

  // What-If State
  const [whatIfData, setWhatIfData] = useState<WhatIfResponse | null>(null);
  const [loadingWhatIf, setLoadingWhatIf] = useState(false);

  // Explain State
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  // Benchmarks State
  const [benchmarks, setBenchmarks] = useState<ModelComparisonResponse | null>(null);

  // Robustness State
  const [robustnessData, setRobustnessData] = useState<any>(null);
  const [stressTestType, setStressTestType] = useState('mcar_missingness');
  const [loadingStress, setLoadingStress] = useState(false);

  // History State
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // Initial Load
  useEffect(() => {
    setCurrentUser(api.getCurrentUser());
    api.fetchOptions().then(opts => {
      setOptions(opts);
      if (opts.default_input) setInputData(opts.default_input);
    }).catch(console.error);

    api.fetchModelBenchmarks().then(setBenchmarks).catch(console.error);
    api.fetchRobustnessBenchmarks().then(setRobustnessData).catch(console.error);
  }, []);

  // Run initial prediction when options load
  useEffect(() => {
    if (options && !prediction) {
      handleRunPrediction();
    }
  }, [options]);

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

  const handleRunSensitivity = async () => {
    setLoadingSens(true);
    try {
      const res = await api.runSensitivity(inputData, sensParam);
      setSensData(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingSens(false);
    }
  };

  const handleRunWhatIf = async () => {
    setLoadingWhatIf(true);
    try {
      const scenarios = [
        {
          scenario_name: 'Baseline (Current Input)',
          inputs: { ...inputData }
        },
        {
          scenario_name: 'Heatwave & Drought (+3°C, -30% Rain)',
          inputs: {
            ...inputData,
            avg_temp_c: inputData.avg_temp_c + 3.0,
            rainfall_mm: Math.max(0, inputData.rainfall_mm * 0.70)
          }
        },
        {
          scenario_name: 'Optimal Irrigation (+20% Rain, Normal Temp)',
          inputs: {
            ...inputData,
            rainfall_mm: inputData.rainfall_mm * 1.20
          }
        }
      ];
      const res = await api.runWhatIf(scenarios);
      setWhatIfData(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingWhatIf(false);
    }
  };

  const handleRunExplain = async () => {
    setLoadingExplain(true);
    try {
      const res = await api.fetchExplanation(inputData);
      setExplainData(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleRunStressTest = async () => {
    setLoadingStress(true);
    try {
      const res = await api.executeStressTest(stressTestType);
      setRobustnessData((prev: any) => ({
        ...prev,
        [stressTestType]: {
          name: res.test_type,
          rates: res.degradation_curve.map((d: any) => d.rate),
          rmse_tonnes: res.degradation_curve.map((d: any) => d.rmse_tonnes_per_ha),
          mae_tonnes: res.degradation_curve.map((d: any) => d.mae_tonnes_per_ha),
          r2: res.degradation_curve.map((d: any) => d.r2_score),
          breakdown_point: `At rate ${res.breakdown_threshold_rate}`,
          scientific_summary: res.scientific_summary
        }
      }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingStress(false);
    }
  };

  const handleFetchHistory = async () => {
    try {
      const res = await api.fetchPredictionHistory();
      setHistoryItems(res.history || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = await api.registerUser(authEmail, authPassword, authName, authOrg);
        setCurrentUser(res.user);
      } else {
        const res = await api.loginUser(authEmail, authPassword);
        setCurrentUser(res.user);
      }
      setAuthModalOpen(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    }
  };

  const handleLogout = () => {
    api.logoutUser();
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Sprout size={28} color="#10b981" />
          <div>
            <h1>Crop Yield AI</h1>
            <p>DL–ML Research Framework</p>
          </div>
        </div>

        <ul className="nav-list">
          <li>
            <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} /> Overview
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'predict' ? 'active' : ''}`} onClick={() => setActiveTab('predict')}>
              <Sprout size={18} /> Yield Prediction
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'whatif' ? 'active' : ''}`} onClick={() => { setActiveTab('whatif'); if (!whatIfData) handleRunWhatIf(); }}>
              <GitCompare size={18} /> What-If Simulator
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'sensitivity' ? 'active' : ''}`} onClick={() => { setActiveTab('sensitivity'); if (!sensData) handleRunSensitivity(); }}>
              <LineChart size={18} /> Climate Sensitivity
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'explain' ? 'active' : ''}`} onClick={() => { setActiveTab('explain'); if (!explainData) handleRunExplain(); }}>
              <Sparkles size={18} /> SHAP Explainability
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'benchmarks' ? 'active' : ''}`} onClick={() => setActiveTab('benchmarks')}>
              <Cpu size={18} /> Model Benchmarks
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'robustness' ? 'active' : ''}`} onClick={() => setActiveTab('robustness')}>
              <ShieldCheck size={18} /> Robustness Lab
            </button>
          </li>
          <li>
            <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); handleFetchHistory(); }}>
              <History size={18} /> Audit History
            </button>
          </li>
        </ul>

        {/* User Status in Sidebar Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Researcher:</span>
              <strong style={{ fontSize: '0.88rem', color: '#fff', wordBreak: 'break-all' }}>{currentUser.email}</strong>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ marginTop: '0.25rem' }}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setAuthModalOpen(true)}>
              <LogIn size={16} /> Login / Register
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="page-title">
            <h2>
              {activeTab === 'overview' && 'Research Overview & System Metrics'}
              {activeTab === 'predict' && 'Crop Yield Prediction & Conformal Bounds'}
              {activeTab === 'whatif' && 'Climate Scenario & What-If Simulator'}
              {activeTab === 'sensitivity' && 'Non-Linear Climate Parameter Sensitivity'}
              {activeTab === 'explain' && 'Model Explainability (SHAP Attributions)'}
              {activeTab === 'benchmarks' && 'Empirical Model Comparison (ML vs DL)'}
              {activeTab === 'robustness' && 'Robustness Lab: Imperfect Data Degradation'}
              {activeTab === 'history' && 'Protected Research Prediction Audit Trail'}
            </h2>
            <p>DL–ML Integrated Agriculture Decision Support System</p>
          </div>

          <div className="auth-badge">
            <span className="badge badge-emerald">
              <CheckCircle size={14} /> API Online
            </span>
            <span className="badge badge-sky">
              <Sparkles size={14} /> DL-ML Stacking v2
            </span>
            <span className="badge badge-amber">
              <ShieldCheck size={14} /> 90% Conformal UQ
            </span>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid-4">
              <div className="stat-box">
                <div className="stat-icon emerald"><Sprout size={24} /></div>
                <div className="stat-info">
                  <p>Clean Dataset</p>
                  <h4>25,932</h4>
                  <span>Deduplicated FAOSTAT rows</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon sky"><Cpu size={24} /></div>
                <div className="stat-info">
                  <p>Ensemble R² Score</p>
                  <h4>0.9822</h4>
                  <span>RMSE: 1.137 t/ha</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon amber"><ShieldCheck size={24} /></div>
                <div className="stat-info">
                  <p>Conformal Coverage</p>
                  <h4>88.99%</h4>
                  <span>Nominal target: 90%</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon rose"><TrendingUp size={24} /></div>
                <div className="stat-info">
                  <p>DL Model Gain</p>
                  <h4>+0.6% R²</h4>
                  <span>MLP beats single RF/XGB</span>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <h3><Sparkles size={18} color="#10b981" /> Academic Contributions</h3>
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <li><strong>DL–ML Stacking Ensemble</strong>: Combines Random Forest, XGBoost, LightGBM, and PyTorch Tabular Neural Network with out-of-fold meta-weights.</li>
                  <li><strong>Conformalized Quantile Calibration</strong>: Replaces heuristic standard deviation with distribution-free prediction intervals maintaining ~90% empirical coverage on untouched test records.</li>
                  <li><strong>Controlled Perturbation Stress Testing</strong>: Benchmarks degradation curves under missing weather station observations (10% to 50% MCAR/MAR) and calibrated sensor noise.</li>
                  <li><strong>Zero-OTP Security Architecture</strong>: FastAPI-managed Argon2id password hashing issuing signed stateless JWTs, backed by PostgreSQL.</li>
                </ul>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3><BarChart2 size={18} color="#0ea5e9" /> Model Performance Comparison</h3>
                </div>
                <div style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={benchmarks?.models || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="model_name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0.95, 1.0]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(val: any) => [`${val}`, 'R² Score']} />
                      <Bar dataKey="r2_random_split" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YIELD PREDICTION */}
        {activeTab === 'predict' && (
          <div className="grid-2">
            {/* Input Form */}
            <div className="card">
              <div className="card-header">
                <h3><Sprout size={18} color="#059669" /> Environmental Input Parameters</h3>
              </div>
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Country / Territory</label>
                  <select 
                    className="form-control" 
                    value={inputData.country} 
                    onChange={e => setInputData({ ...inputData, country: e.target.value })}
                  >
                    {options?.countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Crop Species</label>
                  <select 
                    className="form-control" 
                    value={inputData.crop} 
                    onChange={e => setInputData({ ...inputData, crop: e.target.value })}
                  >
                    {options?.crops.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Annual Rainfall (mm/year)</label>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min={100} 
                    max={3500} 
                    step={10} 
                    value={inputData.rainfall_mm}
                    onChange={e => setInputData({ ...inputData, rainfall_mm: parseFloat(e.target.value) })}
                  />
                  <span className="slider-val">{inputData.rainfall_mm} mm</span>
                </div>
              </div>

              <div className="form-group">
                <label>Average Annual Temperature (°C)</label>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min={5} 
                    max={40} 
                    step={0.5} 
                    value={inputData.avg_temp_c}
                    onChange={e => setInputData({ ...inputData, avg_temp_c: parseFloat(e.target.value) })}
                  />
                  <span className="slider-val">{inputData.avg_temp_c} °C</span>
                </div>
              </div>

              <div className="form-group">
                <label>Pesticides (metric tonnes)</label>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min={0} 
                    max={120000} 
                    step={500} 
                    value={inputData.pesticides_tonnes}
                    onChange={e => setInputData({ ...inputData, pesticides_tonnes: parseFloat(e.target.value) })}
                  />
                  <span className="slider-val">{inputData.pesticides_tonnes.toLocaleString()} t</span>
                </div>
              </div>

              <div className="form-group">
                <label>Observation Year</label>
                <div className="slider-container">
                  <input 
                    type="range" 
                    min={1990} 
                    max={2030} 
                    step={1} 
                    value={inputData.year}
                    onChange={e => setInputData({ ...inputData, year: parseInt(e.target.value) })}
                  />
                  <span className="slider-val">{inputData.year}</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleRunPrediction} disabled={loadingPred}>
                {loadingPred ? 'Running DL-ML Inference...' : 'Predict Crop Yield'}
              </button>
            </div>

            {/* Results Display */}
            <div>
              {prediction && (
                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                  <div className="card-header">
                    <h3>Prediction Outcome & Uncertainty</h3>
                    <span className="badge badge-emerald">{prediction.model_name}</span>
                  </div>

                  <div style={{ textAlign: 'center', padding: '1.5rem 0', background: '#f8fafc', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Crop Yield</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669' }}>
                      {prediction.predicted_yield_tonnes_per_ha} <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>tonnes/ha</span>
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {prediction.predicted_yield_hg_per_ha.toLocaleString()} hectograms / hectare
                    </p>
                  </div>

                  <div className="callout callout-info">
                    <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Nominal 90% Conformal Prediction Interval:</strong>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>
                        [{prediction.conformal_interval_90.lower_bound} — {prediction.conformal_interval_90.upper_bound}] tonnes/ha
                      </p>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
                        Finite-sample non-parametric coverage calibrated using empirical quantiles of absolute error.
                      </p>
                    </div>
                  </div>

                  <div className="callout callout-warning">
                    <HelpCircle size={20} style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Standard Error Bounds (±1.96 RMSE):</strong>
                      <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                        [{Math.max(0, prediction.confidence_interval.lower / 10000).toFixed(2)} — {(prediction.confidence_interval.upper / 10000).toFixed(2)}] tonnes/ha
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab('explain'); handleRunExplain(); }}>
                      <Sparkles size={14} /> View SHAP Explainability
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setActiveTab('whatif'); handleRunWhatIf(); }}>
                      <GitCompare size={14} /> Run What-If Comparison
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WHAT-IF SIMULATOR */}
        {activeTab === 'whatif' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3><GitCompare size={18} color="#0284c7" /> Climate What-If Scenario Comparison</h3>
                <button className="btn btn-primary btn-sm" onClick={handleRunWhatIf} disabled={loadingWhatIf}>
                  {loadingWhatIf ? 'Simulating...' : 'Recalculate Scenarios'}
                </button>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                Simulate how hypothetical climate stresses (heatwaves, droughts, irrigation expansion) shift expected yield relative to current baseline inputs.
              </p>

              {whatIfData && (
                <div style={{ height: 280, marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={whatIfData.comparisons}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="scenario_name" tick={{ fontSize: 12 }} />
                      <YAxis unit=" t/ha" tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val: any) => [`${val} tonnes/ha`, 'Yield']} />
                      <Bar dataKey="predicted_yield_tonnes_per_ha" fill="#0284c7" radius={[6, 6, 0, 0]}>
                        {whatIfData.comparisons.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.delta_from_baseline_pct < 0 ? '#e11d48' : '#059669'} />
                        ))}
                      </Bar>
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {whatIfData && (
              <div className="card">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Scenario Name</th>
                        <th>Temperature</th>
                        <th>Rainfall</th>
                        <th>Predicted Yield</th>
                        <th>90% Conformal Interval</th>
                        <th>Delta vs Baseline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatIfData.comparisons.map(item => (
                        <tr key={item.scenario_name}>
                          <td><strong>{item.scenario_name}</strong></td>
                          <td>{item.inputs.avg_temp_c} °C</td>
                          <td>{item.inputs.rainfall_mm} mm</td>
                          <td><strong>{item.predicted_yield_tonnes_per_ha} t/ha</strong></td>
                          <td>[{item.conformal_interval_90[0]} — {item.conformal_interval_90[1]}]</td>
                          <td style={{ color: item.delta_from_baseline_pct < 0 ? '#e11d48' : (item.delta_from_baseline_pct > 0 ? '#059669' : '#64748b'), fontWeight: 600 }}>
                            {item.delta_from_baseline_pct > 0 ? `+${item.delta_from_baseline_pct}%` : `${item.delta_from_baseline_pct}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CLIMATE SENSITIVITY */}
        {activeTab === 'sensitivity' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3><LineChart size={18} color="#d97706" /> Non-Linear Climate Parameter Sensitivity Sweep</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select className="form-control" style={{ width: 'auto' }} value={sensParam} onChange={e => setSensParam(e.target.value)}>
                    <option value="rainfall_mm">Rainfall (mm)</option>
                    <option value="avg_temp_c">Average Temperature (°C)</option>
                    <option value="pesticides_tonnes">Pesticides (tonnes)</option>
                    <option value="year">Harvest Year</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleRunSensitivity} disabled={loadingSens}>
                    {loadingSens ? 'Sweeping...' : 'Run Sweep'}
                  </button>
                </div>
              </div>

              {sensData && (
                <div>
                  <div className="callout callout-info" style={{ marginBottom: '1.5rem' }}>
                    <TrendingUp size={20} />
                    <span>{sensData.elasticity_summary}</span>
                  </div>

                  <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={sensData.values.map((v, i) => ({ value: v, yield_pred: sensData.predictions_tonnes_per_ha[i] }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="value" tick={{ fontSize: 12 }} />
                        <YAxis unit=" t/ha" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                        <Tooltip formatter={(val: any) => [`${val} tonnes/ha`, 'Predicted Yield']} />
                        <Line type="monotone" dataKey="yield_pred" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SHAP EXPLAINABILITY */}
        {activeTab === 'explain' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h3><Sparkles size={18} color="#10b981" /> Local SHAP Feature Contributions</h3>
                <button className="btn btn-secondary btn-sm" onClick={handleRunExplain} disabled={loadingExplain}>
                  {loadingExplain ? 'Calculating...' : 'Recalculate'}
                </button>
              </div>

              {explainData ? (
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                    {explainData.summary_text}
                  </p>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RBarChart layout="vertical" data={explainData.feature_contributions}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(val: any) => [val, 'SHAP Impact']} />
                        <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                          {explainData.feature_contributions.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.shap_value >= 0 ? '#10b981' : '#e11d48'} />
                          ))}
                        </Bar>
                      </RBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleRunExplain}>Generate SHAP Analysis</button>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Global Feature Importance Hierarchy</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Crop Type (Physiological baseline)', weight: 44.2, color: '#10b981' },
                  { name: 'Country / Geographic Region', weight: 28.5, color: '#0284c7' },
                  { name: 'Average Annual Temperature (°C)', weight: 11.8, color: '#d97706' },
                  { name: 'Pesticide Application (tonnes)', weight: 8.2, color: '#8b5cf6' },
                  { name: 'Annual Aggregate Rainfall (mm)', weight: 5.3, color: '#06b6d4' },
                  { name: 'Observation Year (Tech trend)', weight: 2.0, color: '#64748b' }
                ].map(item => (
                  <li key={item.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                      <strong>{item.name}</strong>
                      <span>{item.weight}%</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.weight}%`, background: item.color, height: '100%' }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 6: MODEL BENCHMARKS */}
        {activeTab === 'benchmarks' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3><Cpu size={18} color="#059669" /> Empirical Multi-Model Benchmark Comparison</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Model Name</th>
                      <th>Family</th>
                      <th>Random Split R²</th>
                      <th>Random Split RMSE</th>
                      <th>Temporal Split R²</th>
                      <th>Temporal Split RMSE</th>
                      <th>Training Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks?.models.map(m => (
                      <tr key={m.model_name} style={{ background: m.model_name.includes('Ensemble') ? '#f0fdf4' : 'inherit' }}>
                        <td><strong>{m.model_name}</strong></td>
                        <td><span className="badge badge-sky">{m.model_family}</span></td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{m.r2_random_split}</td>
                        <td>{m.rmse_random_split_tonnes} t/ha</td>
                        <td style={{ color: '#d97706', fontWeight: 600 }}>{m.r2_temporal_split}</td>
                        <td>{m.rmse_temporal_split_tonnes} t/ha</td>
                        <td>{m.training_time_seconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Verified Findings & Scientific Assessment</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.8' }}>
                • <strong>Deep Learning Gain</strong>: The PyTorch Tabular MLP achieved <strong>R² = 0.9796</strong> and <strong>RMSE = 1.215 t/ha</strong>, demonstrating superior capacity over standalone Random Forest (R² = 0.9740) and XGBoost (R² = 0.9714) in mapping multi-country non-linear interactions.<br />
                • <strong>Stacking Meta-Ensemble</strong>: Out-of-fold Ridge meta-learning yielded the highest overall precision: <strong>R² = 0.9822</strong> and <strong>RMSE = 1.137 t/ha</strong>.<br />
                • <strong>Temporal Shift Reality</strong>: Testing on unseen future years (2009–2013) causes RMSE to increase from ~1.14 to ~1.87 t/ha across all architectures, proving that point estimates without calibrated uncertainty bounds are insufficient for real-world agricultural risk planning.
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: ROBUSTNESS LAB */}
        {activeTab === 'robustness' && (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3><ShieldCheck size={18} color="#e11d48" /> Data Degradation & Missingness Stress Test</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select className="form-control" style={{ width: 'auto' }} value={stressTestType} onChange={e => setStressTestType(e.target.value)}>
                    <option value="mcar_missingness">Missing Completely At Random (MCAR)</option>
                    <option value="mar_missingness">Missing At Random (MAR - Heat Stress)</option>
                    <option value="gaussian_sensor_noise">Gaussian Sensor Noise</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleRunStressTest} disabled={loadingStress}>
                    {loadingStress ? 'Stress Testing...' : 'Run Live Benchmark'}
                  </button>
                </div>
              </div>

              {robustnessData && robustnessData[stressTestType] && (
                <div>
                  <div className="callout callout-warning">
                    <AlertTriangle size={20} />
                    <div>
                      <strong>Breakdown Threshold: </strong>{robustnessData[stressTestType].breakdown_point}
                      <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{robustnessData[stressTestType].scientific_summary}</p>
                    </div>
                  </div>

                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={robustnessData[stressTestType].rates.map((r: any, i: number) => ({
                        rate_pct: `${Math.round(r * 100)}%`,
                        rmse: robustnessData[stressTestType].rmse_tonnes[i],
                        mae: robustnessData[stressTestType].mae_tonnes[i]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="rate_pct" tick={{ fontSize: 12 }} />
                        <YAxis unit=" t/ha" tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: any) => [`${val} tonnes/ha`, 'Error']} />
                        <Legend />
                        <Line type="monotone" dataKey="rmse" name="RMSE (Error)" stroke="#e11d48" strokeWidth={3} />
                        <Line type="monotone" dataKey="mae" name="MAE (Error)" stroke="#0284c7" strokeWidth={2} />
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div className="card">
            <div className="card-header">
              <h3><History size={18} color="#059669" /> Research Prediction Audit Trail</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleFetchHistory}>
                Refresh History
              </button>
            </div>

            {currentUser ? (
              <div className="table-container">
                {historyItems.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th>Crop</th>
                        <th>Year</th>
                        <th>Rainfall</th>
                        <th>Temperature</th>
                        <th>Predicted Yield</th>
                        <th>90% Conformal Interval</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyItems.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.country}</strong></td>
                          <td>{item.crop}</td>
                          <td>{item.year}</td>
                          <td>{item.rainfall_mm} mm</td>
                          <td>{item.avg_temp_c} °C</td>
                          <td><strong>{item.predicted_yield_tonnes_per_ha} t/ha</strong></td>
                          <td>[{item.conformal_lower_bound} — {item.conformal_upper_bound}]</td>
                          <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No past predictions recorded yet. Run a prediction to populate your research log.</p>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <LogIn size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                <h4>Authentication Required</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  User-specific prediction audit logs require secure login.
                </p>
                <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
                  Login to Access History
                </button>
              </div>
            )}
          </div>
        )}

        {/* ZERO-OTP AUTH MODAL */}
        {authModalOpen && (
          <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{authMode === 'login' ? 'Researcher Login' : 'Create Researcher Account'}</h3>
                <button className="close-btn" onClick={() => setAuthModalOpen(false)}>×</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button 
                  className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ flex: 1 }} 
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                >
                  Login
                </button>
                <button 
                  className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-secondary'}`} 
                  style={{ flex: 1 }} 
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                >
                  Register (Zero-OTP)
                </button>
              </div>

              {authError && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    placeholder="researcher@university.edu"
                    value={authEmail} 
                    onChange={e => setAuthEmail(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    required 
                    placeholder="••••••••••••"
                    value={authPassword} 
                    onChange={e => setAuthPassword(e.target.value)} 
                  />
                </div>

                {authMode === 'register' && (
                  <>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Dr. Jane Doe"
                        value={authName} 
                        onChange={e => setAuthName(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Academic Institution / Organization</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Department of Agronomy"
                        value={authOrg} 
                        onChange={e => setAuthOrg(e.target.value)} 
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                  {authMode === 'login' ? 'Sign In' : 'Register & Start Research'}
                </button>
              </form>

              <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                Protected with Argon2id password hashing & stateless JWT authorization. Strictly zero-OTP.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
