import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Scale,
  FileText,
  Lightbulb
} from 'lucide-react';
import { ButtonSpinner } from '../ui/Loader';
import type { ExplainResponse } from '../../types';

interface ExplainTabProps {
  explainData: ExplainResponse | null;
  loading: boolean;
  onRunExplain: () => void;
  onClearExplain?: () => void;
}

const cleanFeatureLabel = (name: string): string => {
  const map: Record<string, string> = {
    rainfall: 'Annual Rainfall (mm)',
    avg_temp: 'Mean Temperature (°C)',
    pesticides: 'Pesticide Application',
    year: 'Observation Year / Tech Trend',
    crop: 'Crop Species',
    country: 'Country / Regional Baseline',
    effective_temp: 'Effective Growing Temperature',
    heat_stress_days: 'Heat Stress Exposure',
    irrigation_pct: 'Irrigation Capacity',
    pesticides_tonnes: 'Pesticide Volume (t)',
    rainfall_mm: 'Precipitation Total',
    dry_spell_days: 'Dry Spell Duration'
  };
  return map[name.toLowerCase()] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getDetailedFactorExplanation = (featureRaw: string, shapValue: number, pct: number): string => {
  const f = featureRaw.toLowerCase();
  const isPos = shapValue >= 0;
  const absVal = Math.abs(shapValue).toFixed(2);
  const pctStr = pct.toFixed(1);

  if (f.includes('crop') || f.includes('item')) {
    return isPos
      ? `This crop cultivar displays superior photosynthetic conversion efficiency and high harvest index in regional soils, driving an additional +${absVal} t/ha (+${pctStr}% relative gain) above reference baselines.`
      : `This crop species has a lower genetic yield ceiling and biomass density in this agro-ecological zone relative to reference multi-crop baselines, subtracting -${absVal} t/ha (${pctStr}% constraint).`;
  }
  if (f.includes('pesticide')) {
    return isPos
      ? `Applied crop protection effectively suppressed foliar pathogens, weed competition, and insect pressure, safeguarding +${absVal} t/ha (+${pctStr}% yield boost).`
      : `Sub-optimal crop protection or chemical saturation created physiological constraints, reducing potential harvest by -${absVal} t/ha (${pctStr}% drag).`;
  }
  if (f.includes('temp') || f.includes('heat')) {
    return isPos
      ? `Mean thermal trajectory remained within the optimal vegetative comfort zone, maximizing enzymatic activity and grain-filling duration (+${absVal} t/ha).`
      : `High thermal accumulation and heat stress during critical flowering/filling stages accelerated senescence and reduced grain weight, penalizing yield by -${absVal} t/ha (${pctStr}% thermal drag).`;
  }
  if (f.includes('rain') || f.includes('precip')) {
    return isPos
      ? `Precipitation volume effectively replenished root-zone soil moisture without causing waterlogging, providing +${absVal} t/ha (+${pctStr}% hydrologic gain).`
      : `Precipitation deficit induced moisture stress in the upper soil profile, restricting nutrient uptake and depressing yield by -${absVal} t/ha (${pctStr}% drought impact).`;
  }
  if (f.includes('year')) {
    return isPos
      ? `Technological modernization, improved agronomic mechanization, and hybrid seed selection trends contributed a secular gain of +${absVal} t/ha.`
      : `Temporal adjustment reflecting earlier historical technology baseline (-${absVal} t/ha).`;
  }
  if (f.includes('country') || f.includes('area')) {
    return isPos
      ? `National soil fertility, regional infrastructure, and geographic endowment provide an inherent structural advantage of +${absVal} t/ha.`
      : `Regional soil characteristics and national geographical baseline factors subtract -${absVal} t/ha compared to global reference benchmarks.`;
  }
  if (f.includes('irrigation')) {
    return isPos
      ? `Supplemental irrigation infrastructure buffered against seasonal dry spells, contributing +${absVal} t/ha.`
      : `Limited irrigation capacity exposed the root zone to intermittent drought stress (-${absVal} t/ha).`;
  }
  return isPos
    ? `This environmental parameter contributed favorably (+${absVal} t/ha, ${pctStr}% weight) towards total harvest outcome.`
    : `This environmental parameter exerted a negative constraint (-${absVal} t/ha, ${pctStr}% weight) restricting maximum potential yield.`;
};

export const ExplainTab: React.FC<ExplainTabProps> = ({ 
  explainData, 
  loading, 
  onRunExplain, 
  onClearExplain 
}) => {
  const sortedFactors = explainData?.feature_contributions
    ? [...explainData.feature_contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    : [];

  const positiveFactors = sortedFactors.filter(f => f.shap_value >= 0);
  const negativeFactors = sortedFactors.filter(f => f.shap_value < 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header & Actions Bar */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 16,
        padding: '20px 24px',
        border: '1.5px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <FileText size={22} style={{ color: 'var(--color-lime)' }} />
            <h2 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              TreeSHAP Factor Attributions & Agronomic Explanations
            </h2>
          </div>
          <p style={{ fontSize: 14, color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            Detailed narrative breakdown explaining exactly why each environmental factor pushed the predicted harvest above or below average.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {explainData && onClearExplain && (
            <button
              type="button"
              onClick={onClearExplain}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--color-forest-border)',
                color: '#CBD5E1',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              Clear Analysis
            </button>
          )}
          <button
            className="btn-primary"
            onClick={onRunExplain}
            disabled={loading}
            style={{ 
              padding: '11px 24px', 
              fontSize: 14.5, 
              borderRadius: 10, 
              fontWeight: 800,
              boxShadow: '0 4px 14px var(--color-lime-glow)'
            }}
          >
            {loading ? (
              <ButtonSpinner size={16} text="Calculating TreeSHAP (10s)..." />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Calculate Factor Breakdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {explainData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
          {/* Executive Yield Impact Hero Banner */}
          <div style={{
            background: 'radial-gradient(circle at 30% 30%, #20311f 0%, #132012 100%)',
            borderRadius: 16,
            padding: '22px 28px',
            border: '1.5px solid var(--color-forest-border)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {/* 3 Large Metric Blocks */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(169, 180, 158, 0.2)'
            }}>
              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Base Expected Yield
                </span>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {explainData.base_value.toFixed(2)} <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 600 }}>t/ha</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0' }}>
                  Regional multi-crop expected baseline
                </p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Net Environmental Shift (Δ)
                </span>
                <div style={{ 
                  fontSize: 32, 
                  fontWeight: 900, 
                  fontFamily: 'var(--font-mono)', 
                  marginTop: 2,
                  color: (explainData.prediction_tonnes_per_ha - explainData.base_value) >= 0 ? '#4ADE80' : '#F87171'
                }}>
                  {(explainData.prediction_tonnes_per_ha - explainData.base_value) >= 0 ? '+' : ''}
                  {(explainData.prediction_tonnes_per_ha - explainData.base_value).toFixed(2)} <span style={{ fontSize: 16, fontWeight: 600 }}>t/ha</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0' }}>
                  Combined sum of all TreeSHAP factors
                </p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Net Predicted Outcome
                </span>
                <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {explainData.prediction_tonnes_per_ha.toFixed(2)} <span style={{ fontSize: 18, color: '#F7F7EF', fontWeight: 600 }}>t/ha</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0' }}>
                  Approx. <strong>{(explainData.prediction_tonnes_per_ha * 10).toFixed(1)}</strong> quintals per hectare
                </p>
              </div>
            </div>

            {/* Executive Synthesis Narrative */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              padding: '16px 20px',
              border: '1px solid rgba(228, 253, 151, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14
            }}>
              <Lightbulb size={24} style={{ color: 'var(--color-lime)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-lime)', marginBottom: 4 }}>
                  Executive Agronomic Summary
                </div>
                <p style={{ fontSize: 15, color: '#F7F7EF', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {explainData.summary_text}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Factor Explanations List (Full Cards with Text) */}
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: '24px 28px',
            border: '1.5px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid rgba(169, 180, 158, 0.16)' }}>
              <div>
                <h3 style={{ fontSize: 18, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>
                  Factor-by-Factor Agronomic Explanations
                </h3>
                <p style={{ fontSize: 13.5, color: '#94A3B8', margin: '3px 0 0' }}>
                  Ranked by absolute game-theoretic influence on your harvest yield.
                </p>
              </div>
              <span style={{ 
                fontSize: 12, 
                fontFamily: 'var(--font-mono)', 
                background: 'rgba(228, 253, 151, 0.1)', 
                color: 'var(--color-lime)',
                border: '1px solid rgba(228, 253, 151, 0.25)',
                padding: '4px 10px', 
                borderRadius: 6,
                fontWeight: 700
              }}>
                {sortedFactors.length} Factors Evaluated
              </span>
            </div>

            {/* Grid of Explanation Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedFactors.map((fc, idx) => {
                const isPos = fc.shap_value >= 0;
                const absVal = Math.abs(fc.shap_value).toFixed(3);
                const explanation = getDetailedFactorExplanation(fc.feature, fc.shap_value, fc.percentage_contribution);
                
                return (
                  <div 
                    key={idx}
                    style={{
                      background: isPos ? 'rgba(74, 222, 128, 0.04)' : 'rgba(248, 113, 113, 0.04)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      border: isPos ? '1px solid rgba(74, 222, 128, 0.22)' : '1px solid rgba(248, 113, 113, 0.22)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isPos ? (
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(74, 222, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} style={{ color: '#4ADE80' }} />
                          </div>
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248, 113, 113, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingDown size={18} style={{ color: '#F87171' }} />
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#F7F7EF' }}>
                            {cleanFeatureLabel(fc.feature)}
                          </span>
                          <span style={{ 
                            marginLeft: 8, 
                            fontSize: 11.5, 
                            fontFamily: 'var(--font-mono)', 
                            color: isPos ? '#4ADE80' : '#F87171',
                            fontWeight: 700
                          }}>
                            {isPos ? 'POSITIVE YIELD DRIVER' : 'PRIMARY CONSTRAINT'}
                          </span>
                        </div>
                      </div>

                      {/* Magnitude & Influence Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                          {fc.percentage_contribution.toFixed(1)}% influence
                        </span>
                        <div style={{
                          background: isPos ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                          border: isPos ? '1px solid rgba(74, 222, 128, 0.35)' : '1px solid rgba(248, 113, 113, 0.35)',
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontSize: 15,
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isPos ? '#4ADE80' : '#F87171'
                        }}>
                          {isPos ? `+${absVal}` : `-${absVal}`} t/ha
                        </div>
                      </div>
                    </div>

                    {/* Full Explanation Text */}
                    <p style={{ fontSize: 14.5, color: '#E2E8F0', lineHeight: 1.55, margin: 0 }}>
                      {explanation}
                    </p>

                    {/* Visual Influence Meter Bar */}
                    <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(3, fc.percentage_contribution))}%`,
                        height: '100%',
                        background: isPos ? 'linear-gradient(90deg, #22C55E, #4ADE80)' : 'linear-gradient(90deg, #EF4444, #F87171)',
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations Based on Limiting Factors */}
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: '22px 28px',
            border: '1.5px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scale size={20} style={{ color: 'var(--color-lime)' }} />
              <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>
                Agronomic Management Recommendations
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-lime)', display: 'block', marginBottom: 4 }}>
                  🌾 Crop Variety Selection
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  To overcome the {negativeFactors[0]?.feature || 'crop'} constraint, consider rotating with higher-yielding climate-resilient regional hybrids tailored for this specific precipitation envelope.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD', display: 'block', marginBottom: 4 }}>
                  🛡️ Targeted Input Optimization
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  Pesticide and nutrient applications should be calibrated around peak vegetative development to maximize the positive +{positiveFactors[0]?.shap_value ? positiveFactors[0].shap_value.toFixed(2) : '0.50'} t/ha boost while avoiding chemical oversaturation.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: 4 }}>
                  ☀️ Thermal & Hydrologic Mitigation
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  Align planting windows so that flowering avoids peak summer heat days, preserving soil moisture and maintaining transpiration efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Assurance Card */}
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 12,
            padding: '14px 22px',
            border: '1px solid var(--color-forest-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-lime)' }} />
              <span style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 600 }}>
                Attribution Architecture: <strong style={{ color: 'var(--color-offwhite)' }}>{explainData.attribution_method || 'Exact TreeSHAP (shap.TreeExplainer)'}</strong>
              </span>
            </div>

            {explainData.additivity_verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                <CheckCircle2 size={16} />
                <span>Additivity Axiom Verified (Σ SHAP + Base = Prediction)</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          padding: '60px 24px',
          border: '1.5px solid var(--color-forest-border)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Sparkles size={44} style={{ color: 'var(--color-lime)', marginBottom: 14 }} />
          <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 900 }}>
            Ready for TreeSHAP Factor Attribution
          </h3>
          <p style={{ fontSize: 15, maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5, color: '#94A3B8' }}>
            Click <strong>Calculate Factor Breakdown</strong> above to generate the full agronomic factor-by-factor explanation for your current scenario.
          </p>
        </div>
      )}
    </div>
  );
};
