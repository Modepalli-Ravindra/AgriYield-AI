import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Scale,
  FileText,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
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

// Plain English mapping for feature names
const cleanFeatureLabel = (name: string): string => {
  const map: Record<string, string> = {
    crop: 'Crop Choice (Plant Type)',
    pesticides: 'Pest & Weed Protection',
    pesticides_tonnes: 'Pesticide Application',
    avg_temp: 'Average Temperature',
    effective_temp: 'Growing Season Temperature',
    rainfall: 'Annual Rainfall',
    rainfall_mm: 'Total Rainfall',
    effective_precip: 'Rainfall During Crop Season',
    growing_season_rain: 'Crop Growing Season Rain',
    heat_stress_days: 'Hot Days (Above 30°C)',
    dry_spell_days: 'Dry Spell Length (Rainless Days)',
    irrigation_pct: 'Farm Irrigation Access',
    year: 'Farming Technology & Modern Seeds',
    country: 'Regional Soil & Climate Location'
  };
  return map[name.toLowerCase()] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Plain English icon for features
const getFeatureIcon = (featureRaw: string) => {
  const f = featureRaw.toLowerCase();
  if (f.includes('rain') || f.includes('precip')) return <Droplets size={18} style={{ color: '#60A5FA' }} />;
  if (f.includes('heat') || f.includes('stress')) return <Flame size={18} style={{ color: '#F87171' }} />;
  if (f.includes('temp')) return <Thermometer size={18} style={{ color: '#FBBF24' }} />;
  if (f.includes('pesticide')) return <Bug size={18} style={{ color: '#34D399' }} />;
  if (f.includes('irrigation')) return <Waves size={18} style={{ color: '#38BDF8' }} />;
  if (f.includes('year')) return <Calendar size={18} style={{ color: '#A78BFA' }} />;
  if (f.includes('country') || f.includes('area')) return <MapPin size={18} style={{ color: '#F472B6' }} />;
  if (f.includes('dry')) return <Sun size={18} style={{ color: '#FBBF24' }} />;
  return <Sparkles size={18} style={{ color: 'var(--color-lime)' }} />;
};

// Plain English simple description of what each factor is
const FEATURE_EXPLAINER_GUIDE = [
  {
    id: 'crop',
    title: 'Crop Choice (Plant Type)',
    icon: '🌾',
    whatIsIt: 'The specific crop variety planted (e.g., Wheat, Rice, Maize, or Potatoes).',
    whyItMatters: 'Different crops naturally have very different weights. Bulky underground root crops like potatoes easily produce 20 to 40 tonnes per hectare, while grains like wheat naturally yield 2 to 5 tonnes per hectare.',
    howToImprove: 'Choose certified high-yielding hybrid seeds that match your local rainfall and soil type.'
  },
  {
    id: 'rainfall',
    title: 'Annual Rainfall (Water Supply)',
    icon: '🌧️',
    whatIsIt: 'Total amount of rain received across the year in millimeters (mm).',
    whyItMatters: 'Water is the lifeblood of crops. It dissolves nutrients in soil so plant roots can drink and grow. Too little rain causes drought, while extreme floods can rot roots.',
    howToImprove: 'If rainfall is low, install drip irrigation or practice rainwater harvesting in farm ponds.'
  },
  {
    id: 'temp',
    title: 'Average Temperature (°C)',
    icon: '🌡️',
    whatIsIt: 'The yearly average temperature of your farm region in degrees Celsius.',
    whyItMatters: 'Every plant has a comfort zone (usually 18°C to 26°C). When it gets too hot, plants lose moisture rapidly and shed flowers; when too cold, plant growth freezes.',
    howToImprove: 'Time your sowing date so flowering happens during the cooler weeks of the season.'
  },
  {
    id: 'pesticides',
    title: 'Pest & Weed Protection',
    icon: '🛡️',
    whatIsIt: 'Quantity of pest, fungus, and weed management products applied.',
    whyItMatters: 'Weeds steal fertilizer from crops, while insects eat leaves and grain pods. Timely protection stops crop losses before harvest.',
    howToImprove: 'Use integrated pest management (IPM) to spray only when necessary, preventing cost and soil damage.'
  },
  {
    id: 'year',
    title: 'Farming Technology & Seeds',
    icon: '🚜',
    whatIsIt: 'The harvest year, reflecting improvements in agricultural science over time.',
    whyItMatters: 'Over the last 30 years, better seeds, balanced chemical fertilizers, and modern machinery have doubled crop yields across the globe.',
    howToImprove: 'Adopt modern mechanized planting and test your soil annually to use the right fertilizer balance.'
  },
  {
    id: 'country',
    title: 'Regional Soil & Climate',
    icon: '🌍',
    whatIsIt: 'The geographic region where your farm is located.',
    whyItMatters: 'Natural soil fertility, organic matter, groundwater depth, and regional sunlight differ greatly between countries and states.',
    howToImprove: 'Add organic compost or green manure to build fertile, sponge-like soil.'
  },
  {
    id: 'heat_stress',
    title: 'Heat Stress Days (>30°C)',
    icon: '🔥',
    whatIsIt: 'The number of very hot days where the temperature crossed 30°C.',
    whyItMatters: 'Extreme heat burns green leaves, damages pollen, and prevents grains from filling to full weight.',
    howToImprove: 'Apply light evening irrigations during heat waves to cool down the microclimate of your field.'
  },
  {
    id: 'irrigation',
    title: 'Farm Irrigation Access',
    icon: '💧',
    whatIsIt: 'The percentage of farmland equipped with canals, borewells, or drip lines.',
    whyItMatters: 'Irrigation acts as insurance. When seasonal rains fail or arrive late, irrigation keeps the crop alive.',
    howToImprove: 'Connect to micro-irrigation subsidies to water crops efficiently with minimal water waste.'
  },
  {
    id: 'dry_spell',
    title: 'Dry Spell Length',
    icon: '⏳',
    whatIsIt: 'The longest number of consecutive days without rain during the growing period.',
    whyItMatters: 'A long stretch without rain parches the topsoil, causing young seedlings to wilt and stunt.',
    howToImprove: 'Use straw mulching over topsoil to trap moisture and prevent evaporation during dry gaps.'
  }
];

// Plain English generator for every individual factor contribution
const getPlainEnglishExplanation = (featureRaw: string, shapValue: number): string => {
  const f = featureRaw.toLowerCase();
  const isPos = shapValue >= 0;
  const absVal = Math.abs(shapValue).toFixed(2);

  if (f.includes('crop') || f.includes('item')) {
    return isPos
      ? `This crop naturally produces heavy biomass and dense harvest weights (such as potatoes or root tubers), giving your harvest an inherent boost of +${absVal} tonnes per hectare.`
      : `Grains like wheat and rice naturally produce lighter, dry grain heads (typically 2 to 5 tonnes per hectare) compared to heavy underground root crops like potatoes. This normal crop difference accounts for -${absVal} tonnes per hectare.`;
  }
  if (f.includes('pesticide')) {
    return isPos
      ? `Applied pest and weed protection kept insects, bugs, and fungal diseases away from your crop, saving and boosting harvest by +${absVal} tonnes per hectare.`
      : `Low or minimal crop protection left the field vulnerable to weed competition and insect damage, pulling expected yield down by -${absVal} tonnes per hectare.`;
  }
  if (f.includes('heat_stress')) {
    return isPos
      ? `There were few excessively hot days, protecting the crop from heat burn (+${absVal} tonnes/ha).`
      : `Too many scorchingly hot days (above 30°C) dried out the crop and reduced grain development, lowering harvest by -${absVal} tonnes per hectare.`;
  }
  if (f.includes('temp')) {
    return isPos
      ? `Temperatures stayed in a comfortable, healthy sweet spot for this crop, helping the plants grow vigorously (+${absVal} tonnes per hectare).`
      : `Temperatures were hotter than the ideal comfort zone for this crop, causing faster moisture loss and heat stress (-${absVal} tonnes per hectare).`;
  }
  if (f.includes('rain') || f.includes('precip')) {
    return isPos
      ? `Generous rainfall supplied plenty of moisture to the root zone, keeping the plants healthy and adding +${absVal} tonnes per hectare.`
      : `Rainfall was on the dry side for this crop, leaving roots thirsty and reducing potential harvest by -${absVal} tonnes per hectare.`;
  }
  if (f.includes('year')) {
    return isPos
      ? `Modern farming advances—including better hybrid seeds, improved fertilizers, and newer farm machinery—contributed an extra +${absVal} tonnes per hectare.`
      : `Earlier historical farming methods and older seed baselines limited harvest potential (-${absVal} tonnes per hectare).`;
  }
  if (f.includes('country') || f.includes('area')) {
    return isPos
      ? `Your region's natural soil fertility, local agricultural infrastructure, and favorable growing climate added +${absVal} tonnes per hectare.`
      : `Regional soil limitations or local growing conditions placed a natural regional drag of -${absVal} tonnes per hectare compared to global averages.`;
  }
  if (f.includes('irrigation')) {
    return isPos
      ? `Good irrigation access ensured crops received reliable water even during rainless weeks, adding +${absVal} tonnes per hectare.`
      : `Lack of irrigation equipment left crops completely dependent on rain, leaving plants vulnerable during dry stretches (-${absVal} tonnes per hectare).`;
  }
  if (f.includes('dry')) {
    return isPos
      ? `Rains fell frequently with no long dry gaps, keeping soil consistently moist (+${absVal} tonnes per hectare).`
      : `An extended stretch without rain parched the soil and slowed crop growth, reducing yield by -${absVal} tonnes per hectare.`;
  }
  return isPos
    ? `This factor had a positive impact on your harvest, adding +${absVal} tonnes per hectare.`
    : `This factor acted as a limiting constraint, reducing your harvest by -${absVal} tonnes per hectare.`;
};

export const ExplainTab: React.FC<ExplainTabProps> = ({ 
  explainData, 
  loading, 
  onRunExplain, 
  onClearExplain 
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const sortedFactors = explainData?.feature_contributions
    ? [...explainData.feature_contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    : [];

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
              Why This Yield Happened (Factor Breakdown)
            </h2>
          </div>
          <p style={{ fontSize: 14, color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            Simple, clear explanations showing exactly what helped your crop yield and what pulled it down.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Toggle Feature Glossary Guide */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              borderRadius: 10,
              background: showGuide ? 'rgba(228, 253, 151, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: showGuide ? '1px solid var(--color-lime)' : '1px solid var(--color-forest-border)',
              color: showGuide ? 'var(--color-lime)' : '#CBD5E1',
              cursor: 'pointer',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.2s ease'
            }}
          >
            <HelpCircle size={16} />
            <span>{showGuide ? 'Hide Feature Guide' : 'What Do Factors Mean?'}</span>
            {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

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
              Clear
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
              <ButtonSpinner size={16} text="Calculating Breakdown (10s)..." />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Calculate Factor Breakdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Feature Guide: What each factor means in plain English */}
      {showGuide && (
        <div style={{
          background: 'rgba(19, 32, 18, 0.95)',
          borderRadius: 16,
          padding: '22px 24px',
          border: '1.5px solid var(--color-forest-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Info size={20} style={{ color: 'var(--color-lime)' }} />
            <div>
              <h3 style={{ fontSize: 17, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0 }}>
                Factor Guide: What Every Metric Means & Why It Matters
              </h3>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '2px 0 0' }}>
                Everything you need to know about the numbers used to forecast your crop yield.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 14 }}>
            {FEATURE_EXPLAINER_GUIDE.map((guide) => (
              <div 
                key={guide.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{guide.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#F7F7EF' }}>
                    {guide.title}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-lime)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    What It Is:
                  </span>
                  <p style={{ fontSize: 13, color: '#CBD5E1', margin: '2px 0 0', lineHeight: 1.45 }}>
                    {guide.whatIsIt}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Why It Matters:
                  </span>
                  <p style={{ fontSize: 13, color: '#CBD5E1', margin: '2px 0 0', lineHeight: 1.45 }}>
                    {guide.whyItMatters}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {/* 3 Large Metric Blocks in Plain English */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(169, 180, 158, 0.2)'
            }}>
              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Reference Benchmark
                </span>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#F7F7EF', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {explainData.base_value.toFixed(2)} <span style={{ fontSize: 16, color: '#94A3B8', fontWeight: 600 }}>t/ha</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0' }}>
                  Typical average across all crops and regions
                </p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Impact of Your Farm's Factors
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
                  Net change from your weather, crop choice, and inputs
                </p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your Estimated Harvest
                </span>
                <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--color-lime)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {explainData.prediction_tonnes_per_ha.toFixed(2)} <span style={{ fontSize: 18, color: '#F7F7EF', fontWeight: 600 }}>t/ha</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0' }}>
                  Approximately <strong style={{ color: 'var(--color-lime)' }}>{(explainData.prediction_tonnes_per_ha * 10).toFixed(1)}</strong> quintals per hectare
                </p>
              </div>
            </div>

            {/* Plain English Summary Narrative */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
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
                  Summary of What Affected Your Harvest
                </div>
                <p style={{ fontSize: 14.5, color: '#F7F7EF', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {explainData.summary_text}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Plain-English Factor Explanations List */}
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
                  Factor-by-Factor Breakdown (Ranked by Impact)
                </h3>
                <p style={{ fontSize: 13.5, color: '#94A3B8', margin: '3px 0 0' }}>
                  Factors at the top made the biggest difference in pushing your harvest above or below average.
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
                {sortedFactors.length} Factors Analyzed
              </span>
            </div>

            {/* Grid of Explanation Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedFactors.map((fc, idx) => {
                const isPos = fc.shap_value >= 0;
                const absVal = Math.abs(fc.shap_value).toFixed(2);
                const explanation = getPlainEnglishExplanation(fc.feature, fc.shap_value);
                
                return (
                  <div 
                    key={idx}
                    style={{
                      background: isPos ? 'rgba(74, 222, 128, 0.04)' : 'rgba(248, 113, 113, 0.04)',
                      borderRadius: 12,
                      padding: '16px 20px',
                      border: isPos ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(248, 113, 113, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 9, 
                          background: isPos ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {getFeatureIcon(fc.feature)}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#F7F7EF' }}>
                            {cleanFeatureLabel(fc.feature)}
                          </div>
                          <span style={{ 
                            fontSize: 11.5, 
                            fontFamily: 'var(--font-mono)', 
                            color: isPos ? '#4ADE80' : '#F87171',
                            fontWeight: 700
                          }}>
                            {isPos ? '✅ HELPED YIELD (BOOST)' : '⚠️ REDUCED YIELD (LIMITING FACTOR)'}
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
                          padding: '5px 14px',
                          fontSize: 15,
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isPos ? '#4ADE80' : '#F87171'
                        }}>
                          {isPos ? `+${absVal}` : `-${absVal}`} t/ha
                        </div>
                      </div>
                    </div>

                    {/* Plain English Explanation Text */}
                    <p style={{ fontSize: 14.5, color: '#E2E8F0', lineHeight: 1.55, margin: 0, fontWeight: 450 }}>
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

          {/* Actionable Recommendations in Simple Farmer-Friendly Language */}
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
                Simple Farm Advice to Improve Next Harvest
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-lime)', display: 'block', marginBottom: 4 }}>
                  🌾 1. Match Crop Variety to Local Climate
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  Select high-yielding certified seeds recommended by your state agricultural university for your specific rainfall zone.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD', display: 'block', marginBottom: 4 }}>
                  🛡️ 2. Apply Pest Protection on Time
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  Early scouting for pests and timely weed removal in the first 30 days protects your crop before bugs can eat plant flowers.
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: 4 }}>
                  ☀️ 3. Beat the Heat and Dry Spells
                </span>
                <p style={{ fontSize: 13.5, color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                  Use straw mulching over topsoil to trap moisture, and plan sowing dates so the crop finishes flowering before peak summer temperatures.
                </p>
              </div>
            </div>
          </div>

          {/* Simple Calculation Assurance Badge */}
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
                Calculation Check: <strong style={{ color: 'var(--color-offwhite)' }}>Exact Factor Math Verified</strong>
              </span>
            </div>

            {explainData.additivity_verified && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                <CheckCircle2 size={16} />
                <span>Base Yield + Factor Adjustments = Final Forecast</span>
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
            Ready to Explain Your Crop Yield
          </h3>
          <p style={{ fontSize: 15, maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.5, color: '#94A3B8' }}>
            Click <strong>Calculate Factor Breakdown</strong> above to see clear explanations for every weather and soil factor affecting your harvest.
          </p>
        </div>
      )}
    </div>
  );
};
