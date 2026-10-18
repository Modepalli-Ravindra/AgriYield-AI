import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

const FAQS = [
  {
    q: 'How does AgriYield AI predict crop yields?',
    a: 'AgriYield AI uses an optimized XGBoost gradient-boosted decision tree pipeline (300 estimators, max depth 6) trained on extensive multi-decade environmental and agronomic datasets. It integrates rainfall, mean temperature, pesticide volume, soil profile, and regional baselines.'
  },
  {
    q: 'What is the significance of the 90% confidence interval?',
    a: 'Rather than only providing an isolated point estimate, the platform applies group-aware conformal prediction calibrated on disjoint validation splits to produce statistically bounded lower and upper yield limits (t/ha).'
  },
  {
    q: 'How are factor contributions calculated?',
    a: 'We implement exact TreeSHAP (Shapley Additive exPlanations) directly on tree decision paths to calculate additive marginal contributions in metric tonnes/ha for each environmental variable.'
  },
  {
    q: 'Can I test custom weather or agrochemical scenarios?',
    a: 'Yes. The Sensitivity & What-If scenario consoles allow you to vary rainfall, temperature, or chemical treatments dynamically by ±50% to observe the predicted yield response curve.'
  },
  {
    q: 'How is user data protected in the platform?',
    a: 'All accounts and prediction records are maintained in a secure PostgreSQL database with Argon2id password hashing, user-level isolation, and encrypted JWT authentication.'
  }
];

export const TrustFaqFooter: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Application Trust & Practical Guidelines Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#152214', borderTop: '1px solid var(--color-forest-border)' }}>
        <div className="container">
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 24,
            padding: '40px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 36
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(228, 253, 151, 0.15)',
                  color: 'var(--color-lime)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheckIcon style={{ width: 20, height: 20 }} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 700 }}>
                  Intended Application Use
                </h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                AgriYield AI is engineered for regional crop yield estimation, agro-climatic sensitivity modeling, 
                and uncertainty assessment. It helps agricultural planners, policy analysts, and farm managers 
                evaluate the likely impact of weather patterns on harvest volume.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(248, 113, 113, 0.15)',
                  color: '#F87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ExclamationTriangleIcon style={{ width: 20, height: 20 }} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 700 }}>
                  Advisory Guidelines & Disclaimers
                </h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Predictions do not account for sudden localized hail damage, post-harvest losses, or unforeseen pest outbreaks. 
                Yield forecasts should be interpreted alongside local agronomist guidance and field measurements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '90px 0', backgroundColor: '#121B11' }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-lime)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              color: 'var(--color-offwhite)',
              marginTop: 12,
              marginBottom: 16,
              fontWeight: 800
            }}>
              Clear answers on models, data & uncertainty.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-forest-surface)',
                    borderRadius: 16,
                    border: isOpen ? '1px solid var(--color-lime)' : '1px solid var(--color-forest-border)',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isOpen ? 'var(--color-lime)' : 'var(--color-offwhite)',
                      fontSize: 16,
                      fontWeight: 600,
                      gap: 16
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUpIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    ) : (
                      <ChevronDownIcon style={{ width: 18, height: 18, flexShrink: 0 }} />
                    )}
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 24px 22px',
                      fontSize: 14.5,
                      color: 'var(--color-muted)',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(169, 180, 158, 0.12)'
                    }}>
                      <div style={{ paddingTop: 14 }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0E160D',
        borderTop: '1px solid var(--color-forest-border)',
        padding: '54px 0 36px',
        color: 'var(--color-muted)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img 
              src="/logo.png" 
              alt="AgriYield AI Logo" 
              style={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.35))'
              }} 
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 2 }}>
                AgriYield AI
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-muted)', maxWidth: 440, margin: 0 }}>
                Intelligent crop yield estimation powered by environmental data.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a
              href="https://github.com/Modepalli-Ravindra/AgriYield-AI"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13.5,
                color: 'var(--color-lime)',
                fontWeight: 600
              }}
            >
              <span>GitHub</span>
              <ArrowTopRightOnSquareIcon style={{ width: 15, height: 15 }} />
            </a>
            <button
              className="btn-primary"
              onClick={onGetStarted}
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              Launch Console
            </button>
          </div>
        </div>
        <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(169, 180, 158, 0.12)', fontSize: 12, color: 'var(--color-muted-dark)', textAlign: 'center' }}>
          AgriYield AI Platform · Enterprise Environmental Intelligence
        </div>
      </footer>
    </>
  );
};
