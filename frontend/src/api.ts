import type { 
  YieldInput, 
  PredictionResponse, 
  BatchPredictionResponse,
  OptionsResponse, 
  ExplainResponse, 
  SensitivityResponse, 
  WhatIfResponse, 
  ModelComparisonResponse,
  GlobalImportanceResponse,
  TokenResponse,
  UserProfile,
  HistoryResponse
} from './types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function fetchHealth(): Promise<{ status: string; database: string; model_loaded: boolean; timestamp: string }> {
  const res = await fetch(`${API_BASE.replace('/api/v1', '')}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchOptions(): Promise<OptionsResponse> {
  const res = await fetch(`${API_BASE}/options`);
  if (!res.ok) throw new Error('Failed to load options');
  return res.json();
}

export async function predictYield(input: YieldInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function predictYieldBatch(items: YieldInput[]): Promise<BatchPredictionResponse> {
  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ items })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Batch prediction failed' }));
    throw new Error(err.detail || 'Batch prediction failed');
  }
  return res.json();
}

export async function fetchExplanation(input: YieldInput): Promise<ExplainResponse> {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Explanation failed' }));
    throw new Error(err.detail || 'Explanation failed');
  }
  return res.json();
}

export async function runSensitivity(input: YieldInput, parameter: string): Promise<SensitivityResponse> {
  const res = await fetch(`${API_BASE}/sensitivity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_data: input, parameter, points: 12 })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Sensitivity analysis failed' }));
    throw new Error(err.detail || 'Sensitivity analysis failed');
  }
  return res.json();
}

export async function runWhatIf(scenarios: Array<{ scenario_name: string; inputs: YieldInput }>): Promise<WhatIfResponse> {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarios })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'What-if analysis failed' }));
    throw new Error(err.detail || 'What-if analysis failed');
  }
  return res.json();
}

export async function fetchModelBenchmarks(): Promise<ModelComparisonResponse> {
  const res = await fetch(`${API_BASE}/models/compare`);
  if (!res.ok) throw new Error('Model comparison failed');
  return res.json();
}

export async function fetchGlobalImportance(): Promise<GlobalImportanceResponse> {
  const res = await fetch(`${API_BASE}/global-importance`);
  if (!res.ok) throw new Error('Global importance failed to load');
  return res.json();
}

export async function fetchRobustnessBenchmarks(): Promise<any> {
  const res = await fetch(`${API_BASE}/robustness/benchmarks`);
  if (!res.ok) throw new Error('Failed to load robustness benchmarks');
  return res.json();
}

export async function executeStressTest(testType: string): Promise<any> {
  const res = await fetch(`${API_BASE}/robustness/stress-test?test_type=${testType}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Stress test failed');
  return res.json();
}

export async function fetchPredictionHistory(): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE}/history`, {
    headers: { ...getAuthHeader() }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication required' }));
    throw new Error(err.detail || 'History requires authentication');
  }
  return res.json();
}

export async function registerUser(email: string, password: string, fullName?: string, organization?: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName, organization })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data: TokenResponse = await res.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user_profile', JSON.stringify(data.user));
  return data;
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  const data: TokenResponse = await res.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('user_profile', JSON.stringify(data.user));
  return data;
}

export async function resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, new_password: newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Password reset failed' }));
    throw new Error(err.detail || 'Password reset failed');
  }
  return res.json();
}

export function getCurrentUser(): UserProfile | null {
  const raw = localStorage.getItem('user_profile');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_profile');
}
