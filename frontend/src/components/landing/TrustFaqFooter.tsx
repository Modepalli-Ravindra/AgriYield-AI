import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, AlertTriangle, Code2 } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the framework convert predictions from model output to metric tonnes?',
    a: 'The underlying XGBoost regressor is trained on FAOSTAT records measured in hectograms per hectare (hg/ha). The API rigorously normalizes this to standard agronomic metric tonnes per hectare (t/ha) by dividing by 10,000 across all response schemas, ensuring consistency with global reporting standards.'
  },
  {
    q: 'What does the nominal 90% conformal uncertainty interval guarantee?',
    a: 'Conformal prediction provides a finite-sample, distribution-free mathematical guarantee: given exchangeable test observations, the true yield will fall within the lower and upper bounds at least 90% of the time. The intervals are calibrated per crop species using empirical quantile non-conformity scores without assuming Gaussian error residuals.'
  },
  {
    q: 'How does the framework handle novel or unknown crops and territories?',
    a: 'When an unknown crop or out-of-vocabulary country is provided, the scikit-learn OneHotEncoder assigns zero weights across all one-hot categories, the system applies global conformal margin fallback, and the API attaches clear advisory disclaimers informing researchers of reduced calibration confidence.'
  },
  {
    q: 'What is the difference between this statistical estimate and actual harvested yield?',
    a: 'AgriYield AI estimates regional aggregate yield potential based on macro-environmental indicators (rainfall, temperature, pesticides). It serves as a decision-support baseline and does not replace localized field soil sampling, micro-irrigation scheduling, pest scouting, or post-harvest loss accounting.'
  },
  {
    q: 'How is prediction data secured and isolated in the database?',
    a: 'All prediction histories and user records are stored in a managed InsForge PostgreSQL instance with strict foreign-key cascades and index-backed user-level isolation. Each query explicitly binds the authenticated user ID extracted from validated Argon2id-hashed JWT Bearer tokens.'
  }
];

export const TrustFaqFooter: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Trust & Limitations Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-offwhite-border)' }}>
        <div className="container">
          <div style={{
            background: 'var(--color-offwhite)',
            borderRadius: 20,
            padding: '36px 32px',
            border: '1px solid var(--color-offwhite-border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 28
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <ShieldCheck size={22} color="var(--color-forest)" />
                <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)' }}>
                  Intended Research Use
                </h3>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
                Designed for agricultural researchers, agronomic policy analysts, and regional food security 
                planners evaluating historical climate sensitivities and macro-environmental yield elasticity.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <AlertTriangle size={22} color="#D97706" />
                <h3 style={{ fontSize: 18, color: 'var(--color-forest-dark)' }}>
                  Limitations & Disclaimers
                </h3>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted-light)', lineHeight: 1.6 }}>
                Regional predictions reflect macro-level FAOSTAT country aggregates. Extreme local microclimatic events, 
                unrecorded pest outbreaks, or abrupt geopolitically induced fertilizer shortages may diverge from statistical bounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '96px 0', backgroundColor: 'var(--color-offwhite)' }}>
        <div className="container">
          <div style={{ maxWidth: 740, marginBottom: 48 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-forest)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              06 / FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 3.8vw, 40px)',
              color: 'var(--color-forest-dark)',
              marginTop: 12,
              letterSpacing: '-0.025em'
            }}>
              Technical & Scientific Inquiries
            </h2>
          </div>

          <div style={{ maxWidth: 840, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid var(--color-offwhite-border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'border-color 0.15s ease'
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
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--color-forest-dark)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: 'var(--color-forest)', flexShrink: 0, marginLeft: 16 }}>
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{
                      padding: '0 24px 22px',
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: 'var(--text-muted-light)',
                      borderTop: '1px solid #F0F2ED'
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer style={{
        backgroundColor: 'var(--color-forest-dark)',
        color: 'var(--color-offwhite)',
        padding: '64px 0 36px',
        borderTop: '1px solid var(--color-forest-border)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            paddingBottom: 40,
            borderBottom: '1px solid rgba(169, 180, 158, 0.14)'
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--color-offwhite)',
                marginBottom: 8
              }}>
                AgriYield AI
              </div>
              <p style={{
                fontSize: 13,
                color: 'var(--color-muted)',
                maxWidth: 420,
                lineHeight: 1.6
              }}>
                An AI-Driven DL–ML Integrated Framework for Crop Yield Prediction Using Environmental Factors.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <a
                href="https://github.com/Modepalli-Ravindra/AgriYield-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: 13, padding: '8px 16px' }}
              >
                <Code2 size={15} />
                <span>GitHub Repository</span>
                <ExternalLink size={12} />
              </a>
              <button
                className="btn-primary"
                onClick={onGetStarted}
                style={{ fontSize: 13, padding: '8px 18px' }}
              >
                Get Started
              </button>
            </div>
          </div>

          <div style={{
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: 'var(--color-muted)'
          }}>
            <span>© 2026 AgriYield AI Research Framework • Branch: feature/dl-ml-research-framework</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>FastAPI • PyTorch • XGBoost • PostgreSQL</span>
          </div>
        </div>
      </footer>
    </>
  );
};
