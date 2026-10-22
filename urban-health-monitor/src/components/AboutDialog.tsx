// ──────────────────────────────────────────────
// Urban Health Monitoring System – About Dialog
// ──────────────────────────────────────────────

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 20,
};

const headingStyle: React.CSSProperties = {
  margin: '0 0 8px',
  fontSize: 15,
  fontWeight: 600,
  color: '#162C36',
};

const bodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.65,
  color: '#536872',
};

const AboutDialog: React.FC<Props> = ({ onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus trap + escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    closeRef.current?.focus();
    // Prevent body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About this prototype"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(22, 44, 54, 0.55)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 600,
          maxHeight: '85vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 14,
          padding: 32,
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
        }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            padding: 0,
            border: '1px solid #DCE5E8',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            color: '#536872',
          }}
        >
          <X size={18} />
        </button>

        <h2
          style={{
            margin: '0 0 24px',
            fontSize: 22,
            fontWeight: 700,
            color: '#162C36',
          }}
        >
          About this prototype
        </h2>

        <div style={sectionStyle}>
          <h3 style={headingStyle}>The problem</h3>
          <p style={bodyStyle}>
            Local environmental information at traffic hotspots is fragmented and
            sparse. Commuters, nearby residents and roadside workers rarely have
            access to a single, integrated view of the air quality, noise levels
            and traffic conditions they encounter daily.
          </p>
        </div>

        <div style={sectionStyle}>
          <h3 style={headingStyle}>Who this is for</h3>
          <p style={bodyStyle}>
            Commuters passing through congested junctions, residents living near
            high-traffic roads, roadside workers exposed for extended hours,
            environmental agencies seeking local monitoring data, and city
            decision-makers evaluating interventions. Hospitals and clinics are
            stakeholders within the wider Phase&nbsp;1 scope.
          </p>
        </div>

        <div style={sectionStyle}>
          <h3 style={headingStyle}>What this prototype does</h3>
          <p style={bodyStyle}>
            It combines simulated air quality, noise and traffic readings from
            four monitoring locations into a single dashboard. Users can compare
            conditions across locations, examine trends over simulated time, and
            explore how different scenarios affect the Urban Stress Index — a
            demo formula that merges the three environmental dimensions.
          </p>
        </div>

        <div style={sectionStyle}>
          <h3 style={headingStyle}>The contribution</h3>
          <p style={bodyStyle}>
            Transparent integration and side-by-side comparison of local
            environmental conditions at urban traffic hotspots, combining air
            quality, acoustic, and traffic parameters in one view.
          </p>
        </div>

        <div style={sectionStyle}>
          <h3 style={headingStyle}>Data disclaimer</h3>
          <p style={bodyStyle}>
            All readings displayed are <strong>simulated</strong>; no live
            sensors are connected. Map positions are fictional and do not
            represent real geographic coordinates. The Urban Stress Index (USI)
            is a demonstration formula and has not been validated through
            epidemiological or psychometric studies.
          </p>
        </div>

        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          <h3 style={headingStyle}>Future scope</h3>
          <p style={bodyStyle}>
            Phase&nbsp;1 envisions integration of water quality and disease
            surveillance data alongside air, noise and traffic monitoring.
            Longer-term goals include predictive analytics, real-time sensor
            feeds, and field validation of the composite scoring model.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
