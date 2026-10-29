import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Lightbulb,
  Droplets,
  Thermometer,
  Bug,
  Calendar,
  MapPin,
  Flame,
  Sun,
  Waves
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
    crop: 'Crop Choice (Plant Variety)',
    pesticides: 'Pest & Weed Protection',
    pesticides_tonnes: 'Pesticide Application',
    avg_temp: 'Average Temperature',
    effective_temp: 'Growing Season Temperature',
    rainfall: 'Annual Rainfall',
    rainfall_mm: 'Total Rainfall',
    effective_precip: 'Crop Season Rain',
    growing_season_rain: 'Growing Season Rain',
    heat_stress_days: 'Hot Days (>30°C)',
    dry_spell_days: 'Dry Spell Length',
    irrigation_pct: 'Farm Irrigation Access',
    year: 'Farming Tech & Modern Seeds',
    country: 'Regional Soil & Climate Location'
  };
  return map[name.toLowerCase()] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getFeatureIcon = (featureRaw: string) => {
  const f = featureRaw.toLowerCase();
  if (f.includes('rain') || f.includes('precip')) return <Droplets size={15} style={{ color: '#60A5FA' }} />;
  if (f.includes('heat') || f.includes('stress')) return <Flame size={15} style={{ color: '#F87171' }} />;
  if (f.includes('temp')) return <Thermometer size={15} style={{ color: '#FBBF24' }} />;
  if (f.includes('pesticide')) return <Bug size={15} style={{ color: '#34D399' }} />;
  if (f.includes('irrigation')) return <Waves size={15} style={{ color: '#38BDF8' }} />;
  if (f.includes('year')) return <Calendar size={15} style={{ color: '#A78BFA' }} />;
  if (f.includes('country') || f.includes('area')) return <MapPin size={15} style={{ color: '#F472B6' }} />;
  if (f.includes('dry')) return <Sun size={15} style={{ color: '#FBBF24' }} />;
  return <Sparkles size={15} style={{ color: 'var(--color-lime)' }} />;
};

const getConciseExplanation = (featureRaw: string, shapValue: number): string => {
  const f = featureRaw.toLowerCase();
  const isPos = shapValue >= 0;
  const absVal = Math.abs(shapValue).toFixed(2);

  if (f.includes('crop') || f.includes('item')) {
    return isPos
      ? `Dense root biomass added +${absVal} t/ha over grain baselines.`
      : `Grain crops naturally produce lighter dry grain heads (-${absVal} t/ha).`;
  }
  if (f.includes('pesticide')) {
    return isPos
      ? `Effective crop protection prevented weed and pest losses (+${absVal} t/ha).`
      : `Minimal protection left crops vulnerable to pest stress (-${absVal} t/ha).`;
  }
  if (f.includes('heat_stress')) {
    return isPos
      ? `Mild heat conditions avoided flower burn (+${absVal} t/ha).`
      : `Excessive heat days dried soil and lowered grain fill (-${absVal} t/ha).`;
  }
  if (f.includes('temp')) {
    return isPos
      ? `Thermal conditions remained in the optimum vegetative zone (+${absVal} t/ha).`
      : `Sub-optimal temperature created thermal stress (-${absVal} t/ha).`;
  }
  if (f.includes('rain') || f.includes('precip')) {
    return isPos
      ? `Ample seasonal rainfall supported healthy canopy growth (+${absVal} t/ha).`
      : `Moisture deficit constrained maximum yield potential (-${absVal} t/ha).`;
  }
  if (f.includes('year')) {
    return isPos
      ? `Modern high-yielding seed varieties and tech boosted yield (+${absVal} t/ha).`
      : `Historical agricultural technology baseline (-${absVal} t/ha).`;
  }
  if (f.includes('country') || f.includes('area')) {
    return isPos
      ? `Regional agro-climatic conditions provided natural advantage (+${absVal} t/ha).`
      : `Local soil and terrain constraints relative to global mean (-${absVal} t/ha).`;
  }
  if (f.includes('irrigation')) {
    return isPos
      ? `Irrigation access buffered crops through dry weeks (+${absVal} t/ha).`
      : `Rain-dependence increased risk during dry intervals (-${absVal} t/ha).`;
  }
  return isPos
    ? `Contributed positively to harvest (+${absVal} t/ha).`
    : `Constrained overall harvest potential (-${absVal} t/ha).`;
};

export const ExplainTab: React.FC<ExplainTabProps> = ({ 
  explainData, 
  loading, 
  onRunExplain, 
  onClearExplain 
}) => {
  const [showAll, setShowAll] = useState(false);

  const sortedFactors = explainData?.feature_contributions
    ? [...explainData.feature_contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    : [];

  const visibleFactors = showAll ? sortedFactors : sortedFactors.slice(0, 6);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      gap: 12,
      boxSizing: 'border-box',
      flex: 1,
      minHeight: 0
    }}>
      {/* Top Header & Actions Bar */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 14,
        padding: '12px 20px',
        border: '1.5px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(228, 253, 151, 0.12)', color: 'var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>
              Factor Contributions Breakdown
            </h2>
            <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0 }}>
              Ranked meteorological and agro-management drivers explaining this harvest.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {explainData && onClearExplain && (
            <button
              type="button"
              onClick={onClearExplain}
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                borderRadius: 7,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--color-forest-border)',
                color: '#CBD5E1',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Clear
            </button>
          )}

          <button
            className="btn-primary"
            onClick={onRunExplain}
            disabled={loading}
            style={{ 
              padding: '8px 20px', 
              fontSize: 13.5, 
              borderRadius: 8, 
              fontWeight: 800,
              boxShadow: '0 3px 10px var(--color-lime-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {loading ? (
              <ButtonSpinner size={13} text="Calculating..." />
            ) : (
              <>
                <Sparkles size={15} />
                <span>{explainData ? 'Recalculate Factors' : 'Calculate Factor Breakdown'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {explainData ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
          minHeight: 0
        }}>
          {/* Executive Yield Impact Summary Card */}
          <div style={{
            background: 'radial-gradient(circle at 30% 30%, #20311f 0%, #132012 100%)',
            borderRadius: 14,
            padding: '16px 20px',
            border: '1.5px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            flexShrink: 0
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 16px', borderRadius: 9, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Baseline Reference Mean
                </span>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                  {explainData.base_value.toFixed(2)} <span style={{ fontSize: 13, fontWeight: 600 }}>t/ha</span>
                </div>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Global multi-crop historical mean</span>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 16px', borderRadius: 9, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Net Farm Factors Impact
                </span>
                <div style={{ 
                  fontSize: 26, 
                  fontWeight: 900, 
                  fontFamily: 'var(--font-mono)', 
                  marginTop: 3,
                  color: (explainData.prediction_tonnes_per_ha - explainData.base_value) >= 0 ? '#4ADE80' : '#F87171'
                }}>
                  {(explainData.prediction_tonnes_per_ha - explainData.base_value) >= 0 ? '+' : ''}
                  {(explainData.prediction_tonnes_per_ha - explainData.base_value).toFixed(2)} <span style={{ fontSize: 13, fontWeight: 600 }}>t/ha</span>
                </div>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Combined weather, inputs & crop shift</span>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px 16px', borderRadius: 9, border: '1px solid rgba(228, 253, 151, 0.25)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                  Final Yield Forecast
                </span>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                  {explainData.prediction_tonnes_per_ha.toFixed(2)} <span style={{ fontSize: 14, color: '#F7F7EF', fontWeight: 600 }}>t/ha</span>
                </div>
                <span style={{ fontSize: 11.5, color: '#CBD5E1', fontWeight: 600 }}>
                  ~<strong>{(explainData.prediction_tonnes_per_ha * 10).toFixed(1)}</strong> quintals per hectare
                </span>
              </div>
            </div>

            {/* Concise AI Narrative Summary */}
            {explainData.summary_text && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 8,
                padding: '9px 16px',
                border: '1px solid rgba(228, 253, 151, 0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <Lightbulb size={18} style={{ color: 'var(--color-lime)', flexShrink: 0 }} />
                <p style={{ fontSize: 12.5, color: '#E2E8F0', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
                  {explainData.summary_text}
                </p>
              </div>
            )}
          </div>

          {/* Clean Factor Drivers Grid (Ranked by Impact) */}
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 14,
            padding: '14px 20px',
            border: '1.5px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: 1,
            minHeight: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(169, 180, 158, 0.16)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#F7F7EF' }}>
                  Ranked Factor Drivers (SHAP Value Attribution)
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                  — sorted by absolute impact
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ 
                  fontSize: 10.5, 
                  fontFamily: 'var(--font-mono)', 
                  background: 'rgba(228, 253, 151, 0.1)', 
                  color: 'var(--color-lime)', 
                  padding: '3px 9px', 
                  borderRadius: 4, 
                  fontWeight: 700 
                }}>
                  {showAll ? `All ${sortedFactors.length} Factors` : 'Top 6 Primary Drivers'}
                </span>
                {sortedFactors.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--color-forest-border)',
                      color: 'var(--color-lime)',
                      padding: '3px 10px',
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {showAll ? 'Show Top 6' : 'Show All'}
                  </button>
                )}
              </div>
            </div>

            {/* 2-Column Grid of Factor Tiles filling the available height */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: showAll ? 'repeat(auto-fill, minmax(72px, 1fr))' : 'repeat(3, 1fr)',
              gap: 10,
              flex: 1,
              minHeight: 0,
              alignItems: 'stretch',
              overflowY: showAll ? 'auto' : 'hidden'
            }}>
              {visibleFactors.map((fc, idx) => {
                const isPos = fc.shap_value >= 0;
                const absVal = Math.abs(fc.shap_value).toFixed(2);
                const explanation = getConciseExplanation(fc.feature, fc.shap_value);
                
                return (
                  <div 
                    key={idx}
                    style={{
                      background: isPos ? 'rgba(74, 222, 128, 0.04)' : 'rgba(248, 113, 113, 0.04)',
                      borderRadius: 9,
                      padding: '11px 16px',
                      border: isPos ? '1px solid rgba(74, 222, 128, 0.22)' : '1px solid rgba(248, 113, 113, 0.22)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Top Row: Icon + Name + Value */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <div style={{ 
                          width: 28, 
                          height: 28, 
                          borderRadius: 7, 
                          background: isPos ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0 
                        }}>
                          {getFeatureIcon(fc.feature)}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#F7F7EF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cleanFeatureLabel(fc.feature)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                        <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                          {fc.percentage_contribution.toFixed(0)}%
                        </span>
                        <span style={{
                          fontSize: 13,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: isPos ? '#4ADE80' : '#F87171',
                          background: isPos ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                          padding: '2px 8px',
                          borderRadius: 5
                        }}>
                          {isPos ? `+${absVal}` : `-${absVal}`} <span style={{ fontSize: 10.5, fontWeight: 600 }}>t/ha</span>
                        </span>
                      </div>
                    </div>

                    {/* Visual Meter Bar */}
                    <div style={{ 
                      width: '100%', 
                      height: 5, 
                      background: 'rgba(255, 255, 255, 0.07)', 
                      borderRadius: 3, 
                      overflow: 'hidden',
                      margin: '5px 0'
                    }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(8, fc.percentage_contribution))}%`,
                        height: '100%',
                        background: isPos ? 'linear-gradient(90deg, #22C55E, #4ADE80)' : 'linear-gradient(90deg, #EF4444, #F87171)',
                        borderRadius: 3
                      }} />
                    </div>

                    {/* 1-Line Explanation */}
                    <p style={{ 
                      fontSize: 12, 
                      color: '#CBD5E1', 
                      margin: 0, 
                      lineHeight: 1.35, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 14,
          padding: '40px 20px',
          border: '1.5px solid var(--color-forest-border)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: 14
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(228, 253, 151, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-lime)',
            border: '1.5px solid rgba(228, 253, 151, 0.3)'
          }}>
            <Sparkles size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, color: 'var(--color-offwhite)', margin: '0 0 6px', fontWeight: 800 }}>
              Ready to Explain Your Crop Harvest
            </h3>
            <p style={{ fontSize: 13.5, maxWidth: 460, margin: 0, lineHeight: 1.45, color: '#94A3B8' }}>
              Click <strong>Calculate Factor Breakdown</strong> above to see exact mathematical contributions from rainfall, temperature, pest management, and seeds.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={onRunExplain}
            disabled={loading}
            style={{ 
              padding: '11px 26px', 
              fontSize: 14, 
              borderRadius: 8, 
              fontWeight: 800,
              boxShadow: '0 3px 12px var(--color-lime-glow)',
              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            {loading ? (
              <ButtonSpinner size={15} text="Calculating..." />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Calculate Factor Breakdown</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
