// ──────────────────────────────────────────────
// Urban Health Monitoring System – Presenter Script Dialog
// ──────────────────────────────────────────────

import React, { useEffect } from 'react';
import { X, Mic } from 'lucide-react';

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
        style={{ maxWidth: 700, padding: 28 }}
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
                1. Context &amp; Interconnected City Grid
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Urban environmental data is usually delayed and disconnected. Our Phase 2 prototype monitors four critical hotspots in North Bengaluru across an interconnected street grid featuring multiple parallel corridors (North Arterial, Central Park Bypass, and South Parkway)."
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#0F766E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                0:45 - 1:30
              </span>
              <strong style={{ fontSize: 14, color: '#162C36' }}>
                2. Transparent Urban Stress Index &amp; Layer Inspection
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Inspect Bagalur Cross or any station. In the detail panel, open <em>'How is this score calculated?'</em> to demonstrate our transparent formula combining <strong>Air Quality (45%)</strong>, <strong>Acoustic Noise (35%)</strong>, and <strong>Traffic Queuing (20%)</strong>. Then toggle between map layers (Noise, PM2.5, Queue, Stress) to show multi-parameter situational awareness."
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ background: '#F0FDF4', padding: 14, borderRadius: 10, border: '1px solid #86EFAC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#16A34A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                1:30 - 2:30
              </span>
              <strong style={{ fontSize: 14, color: '#166534' }}>
                3. Live Commuter Simulation with Shifting Real-Time Bottlenecks
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#14532D', lineHeight: 1.5 }}>
              "Press <strong>Start</strong>! Watch the commuter on the bike navigate the city. In Round 1, Bagalur Cross is jammed: the commuter receives an early alert, <strong>abandons the direct red route</strong>, and diverts via Central Park Bypass. When the round completes, the congestion <strong>dynamically shifts</strong> to Galleria Mall or Phoenix Mall—and the commuter immediately adapts by choosing an entirely different clean corridor! You can also click the quick buttons above the map to demonstrate any specific hotspot bottleneck on demand."
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ background: '#0F766E', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                2:30 - 3:00
              </span>
              <strong style={{ fontSize: 14, color: '#162C36' }}>
                4. Health Impact Verdict &amp; CSV Export
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              "Scroll down to the <strong>Route Comparison Panel</strong> to demonstrate that dynamic rerouting avoids up to 65% of inhaled pollutants and 20 dB of noise strain. Finally, click <strong>'Export current readings'</strong> to generate municipal CSV records, and click <strong>Reset</strong> for Q&amp;A."
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
            Ready to present!
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresenterScriptDialog;
