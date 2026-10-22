// ──────────────────────────────────────────────
// Urban Health Monitoring System – Header
// ──────────────────────────────────────────────

import React, { useState } from 'react';
import { Info, Mic } from 'lucide-react';
import AboutDialog from './AboutDialog';
import PresenterScriptDialog from './PresenterScriptDialog';

interface HeaderProps {
  onAboutClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAboutClick }) => {
  const [internalAboutOpen, setInternalAboutOpen] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);

  const handleOpenAbout = () => {
    if (onAboutClick) {
      onAboutClick();
    } else {
      setInternalAboutOpen(true);
    }
  };

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid #DCE5E8',
          fontFamily: 'Inter, system-ui, sans-serif',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: '#162C36',
                lineHeight: 1.2,
              }}
            >
              Urban Health Monitoring System
            </h1>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#4A3800',
                background: '#FFC107',
                borderRadius: 12,
                lineHeight: '18px',
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
              }}
            >
              Demo data
            </span>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#065F46',
                background: '#D1FAE5',
                borderRadius: 12,
                lineHeight: '18px',
                letterSpacing: 0.3,
                whiteSpace: 'nowrap',
              }}
            >
              Adaptive Commute Assistant Active
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: '#536872',
              lineHeight: 1.4,
            }}
          >
            Air, noise and traffic across four urban hotspots &bull; Real-time dynamic exposure avoidance
          </p>
        </div>

        {/* Right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Presenter Script Button */}
          <button
            onClick={() => setScriptOpen(true)}
            aria-label="3-Minute Presentation Guide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#0F766E',
              background: '#DFF3EF',
              border: '1px solid #99F6E4',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Mic size={15} />
            Presentation Script
          </button>

          {/* About button */}
          <button
            onClick={handleOpenAbout}
            aria-label="About this prototype"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: '#536872',
              background: 'transparent',
              border: '1px solid #DCE5E8',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F4F7F8';
              (e.currentTarget as HTMLButtonElement).style.color = '#162C36';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#536872';
            }}
          >
            <Info size={15} />
            About Project
          </button>
        </div>
      </header>

      {scriptOpen && <PresenterScriptDialog onClose={() => setScriptOpen(false)} />}
      {!onAboutClick && internalAboutOpen && (
        <AboutDialog onClose={() => setInternalAboutOpen(false)} />
      )}
    </>
  );
};

export default Header;
