import React, { useState, useEffect } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface FloatingNavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="floating-nav-wrapper">
      <nav 
        className="floating-navbar" 
        style={{
          boxShadow: scrolled ? '0 20px 48px rgba(0, 0, 0, 0.55)' : '0 12px 36px rgba(0, 0, 0, 0.35)'
        }}
        aria-label="Main Navigation"
      >
        <a 
          href="#" 
          className="nav-brand" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <img 
            src="/logo.png" 
            alt="AgriYield AI Logo" 
            style={{
              width: 38,
              height: 38,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(228, 253, 151, 0.35))'
            }} 
          />
          <span>AgriYield AI</span>
        </a>

        <ul className="nav-links">
          <li>
            <button className="nav-link" onClick={() => scrollToSection('overview')}>
              Overview
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection('features')}>
              Capabilities
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection('methodology')}>
              Workflow
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection('insights')}>
              Benchmarks
            </button>
          </li>
          <li>
            <button className="nav-link" onClick={() => scrollToSection('faq')}>
              FAQ
            </button>
          </li>
        </ul>

        <div className="nav-actions">
          <button 
            className="nav-btn-signin" 
            onClick={() => onOpenAuth('login')}
          >
            Sign In
          </button>
          <button 
            className="nav-btn-cta" 
            onClick={() => onOpenAuth('register')}
          >
            Get Started
          </button>
          <button 
            className="nav-mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <XMarkIcon style={{ width: 22, height: 22 }} /> : <Bars3Icon style={{ width: 22, height: 22 }} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 86,
          left: 16,
          right: 16,
          background: 'rgba(25, 37, 24, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--color-forest-border)',
          borderRadius: 20,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 1001,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)',
          pointerEvents: 'auto'
        }}>
          <button className="nav-link" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 16 }} onClick={() => scrollToSection('overview')}>
            Overview
          </button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 16 }} onClick={() => scrollToSection('features')}>
            Capabilities
          </button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 16 }} onClick={() => scrollToSection('methodology')}>
            Workflow
          </button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 16 }} onClick={() => scrollToSection('insights')}>
            Benchmarks
          </button>
          <button className="nav-link" style={{ textAlign: 'left', padding: '10px 14px', fontSize: 16 }} onClick={() => scrollToSection('faq')}>
            FAQ
          </button>
          <div style={{ height: 1, background: 'rgba(169, 180, 158, 0.2)', margin: '8px 0' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, padding: '11px 0', fontSize: 14 }}
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
            >
              Sign In
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1, padding: '11px 0', fontSize: 14 }}
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
