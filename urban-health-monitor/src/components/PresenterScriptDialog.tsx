// ──────────────────────────────────────────────
// Urban Health Monitoring System – Presenter Script Dialog
// ──────────────────────────────────────────────

import React, { useEffect } from 'react';
import { X, Mic, CheckCircle, Navigation, MapPin } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const PresenterScriptDialog: React.FC<Props> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="dialog-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, padding: 28 }}
      >
        <button
          onClick={onClose}
          className="dialog-close"
          aria-label="Close presenter guide"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#DFF3EF',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mic size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#162C36' }}>
              3-Minute College Presentation Guide
            </h2>
            <span style={{ fontSize: 13, color: '#536872' }}>
              Step-by-step cue card for your teacher-facing demonstration
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Step 1 */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#0F766E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                0:00 - 0:45
              </span>
              <strong style={{ fontSize: 14, color: '#162C36' }}>
                1. Context &amp; Hotspot Vulnerability Ranking
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Urban environmental data is usually delayed and disconnected. Our Phase 2 study monitored four key hotspots in North Bengaluru. As shown in our top ranking, <strong>Bagalur Cross is the most severely stressed</strong> with AQI 248 and 82.5 dB noise, followed by Galleria Mall and Phoenix Mall, while <strong>Hebbal Flyover is our cleanest approach</strong>."
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#0F766E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                0:45 - 1:30
              </span>
              <strong style={{ fontSize: 14, color: '#162C36' }}>
                2. Transparent Urban Stress Index &amp; Map Layers
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Click on Bagalur Cross to reveal its active alert. In the detail panel, open <em>'How is this score calculated?'</em> to demonstrate our transparent formula combining <strong>Air (45%)</strong>, <strong>Noise (35%)</strong>, and <strong>Traffic (20%)</strong>. Then toggle between the <strong>Noise</strong>, <strong>Queue</strong>, and <strong>Stress</strong> layers to prove synchronized multi-station monitoring."
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 10, border: '1px solid #86EFAC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#16A34A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                1:30 - 2:30
              </span>
              <strong style={{ fontSize: 14, color: '#166534' }}>
                3. Live Commuter Simulation &amp; Dynamic Route Abandonment
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#14532D', lineHeight: 1.5 }}>
              "Press the <strong>Start button</strong>! Watch how the person on the bike moves along the North Corridor. As the sensor network warns of toxic conditions ahead at Bagalur Cross, the commuter <strong>actively abandons the direct red hazard route</strong> and diverts south onto the clean Central Park Bypass. This continuous loop proves how real-time IoT alerts protect citizens' lungs and ears."
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#0F766E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                2:30 - 3:00
              </span>
              <strong style={{ fontSize: 14, color: '#162C36' }}>
                4. Scenario Playback &amp; CSV Export
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Switch scenario to <strong>Rush Hour</strong> to demonstrate network-wide escalation, or <strong>Improved conditions</strong>. Finally, click <strong>'Export current readings'</strong> to demonstrate CSV data generation for municipal authorities, and click <strong>Reset</strong> for Q&amp;A."
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              background: '#0F766E',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Got it, ready to present!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresenterScriptDialog;
