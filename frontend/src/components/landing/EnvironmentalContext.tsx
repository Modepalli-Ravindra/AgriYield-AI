import React from 'react';
import { CloudRain, Thermometer, FlaskConical, Calendar, Globe, Sprout } from 'lucide-react';

const INPUT_FIELDS = [
  {
    icon: Globe,
    name: 'Country / Territory',
    field: 'country',
    unit: 'Categorical (101 regions)',
    typical: 'India, United States, France, etc.',
    importance: 'Captures baseline geographical, soil typology, and macroscopic regional agro-climatic baseline characteristics.'
  },
  {
    icon: Sprout,
    name: 'Crop Species',
    field: 'crop',
    unit: 'Categorical (10 staple crops)',
    typical: 'Wheat, Maize, Rice, Potatoes, etc.',
    importance: 'Governs photosynthetic pathway (C3 vs C4), physiological water use efficiency, and inherent biological yield ceilings.'
  },
  {
    icon: CloudRain,
    name: 'Annual Precipitation',
    field: 'rainfall_mm',
    unit: 'mm / year',
    typical: '200 — 3,200 mm',
    importance: 'Directly drives soil moisture availability during critical phenological growth, flowering, and grain-filling stages.'
  },
  {
    icon: Thermometer,
    name: 'Average Surface Temperature',
    field: 'avg_temp_c',
    unit: '°C',
    typical: '1.5 — 30.5 °C',
    importance: 'Determines thermal accumulation (Growing Degree Days), evapotranspiration rates, and thermal shock thresholds.'
  },
  {
    icon: FlaskConical,
    name: 'Pesticide Application',
    field: 'pesticides_tonnes',
    unit: 'metric tonnes',
    typical: '0.04 — 398,000 tonnes',
    importance: 'Quantifies agrochemical intensity and crop protection index mitigating biomass loss from pests and fungal pathogens.'
  },
  {
    icon: Calendar,
    name: 'Observation Year',
    field: 'year',
    unit: 'Calendar Year',
    typical: '1990 — 2013',
    importance: 'Serves as an empirical proxy for technological progression, mechanization, hybrid seed adoption, and agronomic management.'
  }
];

export const EnvironmentalContext: React.FC = () => {
  return (
    <section style={{ padding: '96px 0', backgroundColor: 'var(--color-offwhite)' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 50 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-forest)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            05 / ENVIRONMENTAL INPUT VARIABLES
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-forest-dark)',
            marginTop: 12,
            marginBottom: 16,
            letterSpacing: '-0.025em'
          }}>
            Agronomic parameters accepted by the model.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
            The backend strictly validates six primary environmental and technological features 
            derived from curated FAOSTAT agricultural records.
          </p>
        </div>

        {/* Input Parameters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {INPUT_FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.field}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--color-offwhite-border)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: 'rgba(45, 62, 44, 0.08)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, color: 'var(--color-forest-dark)', fontWeight: 700 }}>
                      {f.name}
                    </h4>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-muted-light)' }}>
                      api: {f.field}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'var(--color-offwhite)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12
                }}>
                  <span style={{ color: 'var(--text-muted-light)' }}>Unit:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-forest)' }}>{f.unit}</span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-muted-light)', lineHeight: 1.55, marginTop: 'auto' }}>
                  {f.importance}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
