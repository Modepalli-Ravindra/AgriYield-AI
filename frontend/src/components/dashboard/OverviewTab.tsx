import React from 'react';
import { SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { 
  ArrowRight, 
  LineChart, 
  Sliders, 
  Layers, 
  GitCompare, 
  CheckCircle2,
  History,
  ShieldCheck,
  BarChart3,
  CloudSun,
  Database
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface OverviewTabProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ currentUser, onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E2D1D 0%, #152214 60%, #10190F 100%)',
        borderRadius: 20,
        padding: '32px 36px',
        color: 'var(--color-offwhite)',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 24
      }}>
        <div style={{ maxWidth: 650 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 100,
            background: 'rgba(228, 253, 151, 0.12)',
            color: 'var(--color-lime)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            marginBottom: 12
          }}>
            <CheckCircle2 size={13} />
            <span>AI CROP INTELLIGENCE PLATFORM</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 10 }}>
            Welcome back, {currentUser?.full_name || currentUser?.email.split('@')[0] || 'Researcher'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            The AgriYield AI engine is online and ready. Enter environmental and climate factors to estimate 
            crop yields, see which factors matter most, and explore what-if farming scenarios.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => onNavigate('predict')}
            style={{ padding: '12px 22px', fontSize: 14 }}
          >
            <SparklesIcon style={{ width: 16, height: 16 }} />
            <span>New Prediction</span>
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('history')}
            style={{ padding: '12px 22px', fontSize: 14 }}
          >
            <History size={16} />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Common-People Friendly Key Metrics Cards — Deep Themed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 20
      }}>
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 18,
          padding: 24,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BarChart3 size={16} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Prediction Accuracy
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
            96.8% <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-muted)' }}>Precision</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Verified on thousands of real harvests across 101 countries with standard 1.46 t/ha error margin.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 18,
          padding: 24,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Confidence Range
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-lime)', marginBottom: 4 }}>
            90% Bounds
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Provides realistic minimum and maximum harvest numbers so you know best and worst cases.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 18,
          padding: 24,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CloudSun size={16} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Analyzed Factors
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
            6 Factors
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Rainfall, Average Temperature, Fertilizer, Pesticides, Region, and Crop Type.
          </p>
        </div>

        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 18,
          padding: 24,
          border: '1px solid var(--color-forest-border)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Database size={16} style={{ color: 'var(--color-lime)' }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Cloud Storage
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 4 }}>
            InsForge Postgres
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.5 }}>
            All your yield predictions are securely saved to your private account for history and export.
          </p>
        </div>
      </div>

      {/* Practical Features Grid — Plain Language, Deep Themed */}
      <div>
        <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 16, fontWeight: 700 }}>
          What would you like to do today?
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20
        }}>
          <div 
            onClick={() => onNavigate('predict')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <ChartBarIcon style={{ width: 20, height: 20 }} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Single Crop Prediction
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Choose a crop and region, enter rain and temperature, and get instant yield in tonnes per hectare.
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Start Prediction <ArrowRight size={14} />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('batch')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <Layers size={20} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Batch Crop Analysis
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Predict multiple fields or crops all at once (up to 50 records) in a single fast run.
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Open Batch Tool <ArrowRight size={14} />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('explain')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <LineChart size={20} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Why This Yield? (Factor Contributions)
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              See transparently whether it was the rainfall, temperature, or fertilizer that pushed the yield up or down.
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View Factor Breakdown <ArrowRight size={14} />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('whatif')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <GitCompare size={20} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              What-If Scenario Planning
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Compare current farming practices against proposed changes (e.g. +20% fertilizer or 2°C hotter year).
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Simulate Scenarios <ArrowRight size={14} />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('sensitivity')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <Sliders size={20} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Climate Sensitivity Curves
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Inspect how responsive a crop is to varying rain or heat levels to find optimal growing conditions.
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Test Sensitivity <ArrowRight size={14} />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('history')}
            style={{
              background: 'var(--color-forest-surface)',
              borderRadius: 18,
              padding: 24,
              border: '1px solid var(--color-forest-border)',
              boxShadow: 'var(--shadow-card)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14
            }}>
              <History size={20} />
            </div>
            <h4 style={{ fontSize: 17, color: 'var(--color-offwhite)', marginBottom: 6, fontWeight: 700 }}>
              Prediction History & Export
            </h4>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Review all past runs, analyze average yields per crop, and export everything directly to Excel/CSV.
            </p>
            <span style={{ fontSize: 13, color: 'var(--color-lime)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              View History <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

