import React from 'react';
import { 
  CloudIcon, 
  SunIcon, 
  BeakerIcon, 
  CalendarDaysIcon, 
  GlobeAltIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

const INPUT_FIELDS = [
  {
    icon: GlobeAltIcon,
    name: 'Country / Region',
    field: 'country',
    unit: '101 Global Regions',
    typical: 'India, United States, France, etc.',
    importance: 'Captures baseline soil typology, regional topography, and macroscopic agro-climatic conditions.'
  },
  {
    icon: SparklesIcon,
    name: 'Crop Species',
    field: 'crop',
    unit: '10 Staple Crops',
    typical: 'Wheat, Maize, Rice, Potatoes, etc.',
    importance: 'Governs photosynthetic efficiency (C3 vs C4), physiological water needs, and biological yield ceilings.'
  },
  {
    icon: CloudIcon,
    name: 'Precipitation',
    field: 'rainfall_mm',
    unit: 'mm / year',
    typical: '200 — 3,200 mm',
    importance: 'Directly drives soil moisture availability during critical vegetative, flowering, and grain-filling stages.'
  },
  {
    icon: SunIcon,
    name: 'Mean Temperature',
    field: 'avg_temp_c',
    unit: '°C',
    typical: '1.5°C — 30.5°C',
    importance: 'Controls thermal growing degree days (GDD), transpiration rates, and metabolic heat stress thresholds.'
  },
  {
    icon: BeakerIcon,
    name: 'Pesticide Application',
    field: 'pesticides_tonnes',
    unit: 'metric tonnes',
    typical: '0.04 — 398,000 tonnes',
    importance: 'Quantifies crop protection intensity mitigating biomass loss from regional pests and fungal pathogens.'
  },
  {
    icon: CalendarDaysIcon,
    name: 'Harvest Year',
    field: 'year',
    unit: 'Calendar Year',
    typical: 'Historical & Present',
    importance: 'Accounts for technological improvements, modern hybrid seed adoption, and improved agronomic practices.'
  }
];

export const EnvironmentalContext: React.FC = () => {
  return (
    <section style={{ padding: '90px 0', backgroundColor: '#152214' }}>
      <div className="container">
        <div style={{ maxWidth: 740, marginBottom: 50 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-lime)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            ENVIRONMENTAL DRIVERS
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            color: 'var(--color-offwhite)',
            marginTop: 12,
            marginBottom: 16,
            fontWeight: 800
          }}>
            Agricultural features analyzed by the pipeline.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Every prediction is conditioned on genuine agro-climatic indicators validated against 
            the backend API schema. Below are the 6 core environmental dimensions analyzed.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {INPUT_FIELDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--color-forest-surface)',
                  borderRadius: 18,
                  padding: 28,
                  border: '1px solid var(--color-forest-border)',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16
                  }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: 'rgba(228, 253, 151, 0.12)',
                      color: 'var(--color-lime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: 20, height: 20 }} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: 'rgba(228, 253, 151, 0.15)',
                      color: 'var(--color-lime)',
                      padding: '4px 10px',
                      borderRadius: 100
                    }}>
                      {item.unit}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, color: 'var(--color-offwhite)', marginBottom: 8, fontWeight: 700 }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: 16 }}>
                    {item.importance}
                  </p>
                </div>

                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid rgba(169, 180, 158, 0.15)',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-muted-light)'
                }}>
                  Typical Range: <span style={{ color: 'var(--color-offwhite)', fontWeight: 600 }}>{item.typical}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
