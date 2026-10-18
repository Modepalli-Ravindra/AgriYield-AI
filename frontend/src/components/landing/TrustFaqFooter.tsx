import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the framework calculate crop yields in metric tonnes?',
    a: 'The underlying XGBoost regressor evaluates agricultural indicators in hectograms per hectare (hg/ha) and standardizes them to metric tonnes per hectare (t/ha) by dividing by 10,000, aligning with international agronomic reporting standards.'
  },
  {
    q: 'What does the 90% conformal uncertainty interval guarantee?',
    a: 'Conformal prediction provides a distribution-free mathematical guarantee: given typical test conditions, the true harvest yield will fall within the lower and upper bounds at least 90% of the time, calculated crop-by-crop without unrealistic gaussian assumptions.'
  },
  {
    q: 'How does the framework handle unknown crops or regions?',
    a: 'When an uncataloged crop or regional name is supplied, the encoder applies neutral categorical zero weights, activates global uncertainty margins, and includes an advisory notice informing the user of broader variance.'
  },
  {
    q: 'What is the difference between this estimate and actual harvest?',
    a: 'AgriYield AI estimates yield potential based on macro-environmental conditions (rainfall, temperature, pesticides). It serves as a dependable strategic baseline and complements localized soil moisture and micro-irrigation management.'
  },
  {
    q: 'How is user data protected in the cloud database?',
    a: 'All accounts and prediction records are maintained in a secure InsForge PostgreSQL database with Argon2id password hashing, user-level isolation, and encrypted JWT authentication.'
  }
];

export const TrustFaqFooter: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Trust & Scientific Limitations Section */}
      <section style={{ padding: '90px 0', backgroundColor: '#152214', borderTop: '1px solid var(--color-forest-border)' }}>
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
                  <ShieldCheck size={20} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 700 }}>
                  Intended Research Application
                </h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                AgriYield AI is engineered for regional crop yield estimation, agro-climatic sensitivity modeling, 
                and uncertainty assessment. It helps agricultural researchers, policy analysts, and farm managers 
                assess the likely impact of weather anomalies on harvest volume.
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
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 700 }}>
                  Model Limitations & Farm Disclaimers
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
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-lime)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              06 / FREQUENTLY ASKED QUESTIONS
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
                      color: isOpen ? 'var(--color-lime)' : 'var(--color-offwhite)',
                      fontSize: 16,
                      fontWeight: 600,
                      gap: 16
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-offwhite)', marginBottom: 6 }}>
              AgriYield AI
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', maxWidth: 440 }}>
              An AI-driven DL–ML integrated framework for crop yield prediction using environmental factors.
            </p>
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
              <span>GitHub Repository</span>
              <ExternalLink size={14} />
            </a>
            <button
              className="btn-primary"
              onClick={onGetStarted}
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              Sign In / Register
            </button>
          </div>
        </div>
        <div className="container" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(169, 180, 158, 0.12)', fontSize: 12, color: 'var(--color-muted-dark)', textAlign: 'center' }}>
          AgriYield AI Platform • Research & Production Release
        </div>
      </footer>
    </>
  );
};
