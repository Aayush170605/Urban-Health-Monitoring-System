// ──────────────────────────────────────────────
// Urban Health Monitoring System – Route Comparison
// ──────────────────────────────────────────────

import React from 'react';
import { Navigation, AlertOctagon, CheckCircle2, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { useDemoState } from '../state/DemoProvider';

export const RouteComparisonCard: React.FC = () => {
  const { readingsByLocation, scenario } = useDemoState();
  const bagalur = readingsByLocation['bagalur-cross'];

  const bagalurAqi = bagalur ? Math.round(bagalur.aqi) : 248;
  const bagalurNoise = bagalur ? bagalur.noiseLAeqDbA.toFixed(1) : '82.5';
  const bagalurQueue = bagalur ? bagalur.queueLengthMetres : 220;

  // Clean detour metrics (traveling along the Central Park Bypass)
  const detourAqi = Math.round(bagalurAqi * 0.35); // ~75-85 AQI
  const detourNoise = (parseFloat(bagalurNoise) - 18.5).toFixed(1); // ~64 dB
  const detourQueue = 0; // free-flowing park bypass

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
        border: '1px solid #DCE5E8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#DFF3EF',
              color: '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#162C36' }}>
              Adaptive Commuter Health Navigation
            </h3>
            <span style={{ fontSize: 12, color: '#536872' }}>
              Real-time exposure avoidance based on sensor telemetry
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            padding: '3px 8px',
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <TrendingDown size={14} /> -65% Exposure Saved
        </span>
      </div>

      {/* Side-by-Side Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Abandoned Direct Path */}
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#991B1B' }}>
            <AlertOctagon size={16} />
            <strong style={{ fontSize: 13 }}>Direct Path (Abandoned)</strong>
          </div>
          <div style={{ fontSize: 11, color: '#7F1D1D', lineHeight: 1.4 }}>
            Traverses straight through <strong>Bagalur Cross</strong> junction bottleneck.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Inhaled AQI:</span>
              <strong style={{ color: '#991B1B' }}>{bagalurAqi} (Poor / Toxic)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Acoustic Noise:</span>
              <strong style={{ color: '#991B1B' }}>{bagalurNoise} dB(A) (Loud)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Junction Queue:</span>
              <strong style={{ color: '#991B1B' }}>{bagalurQueue} m idling</strong>
            </div>
          </div>
        </div>

        {/* Clean Detour Path */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
            <CheckCircle2 size={16} />
            <strong style={{ fontSize: 13 }}>Adaptive Green Detour (Chosen)</strong>
          </div>
          <div style={{ fontSize: 11, color: '#14532D', lineHeight: 1.4 }}>
            Diverts south along <strong>Central Park Bypass (y=320)</strong>.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#14532D' }}>Inhaled AQI:</span>
              <strong style={{ color: '#166534' }}>{detourAqi} (Satisfactory)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#14532D' }}>Acoustic Noise:</span>
              <strong style={{ color: '#166534' }}>{detourNoise} dB(A) (Calm)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#14532D' }}>Junction Queue:</span>
              <strong style={{ color: '#166534' }}>0 m (Free flow)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        style={{
          background: '#F8FAFC',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#334155',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={15} color="#0F766E" />
          <span>
            <strong>Health Verdict:</strong> Diverting protects commuter from hazardous particulate inhalation &amp; hearing strain.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0F766E', fontWeight: 600 }}>
          <Clock size={13} />
          <span>Trip: ~4 min saved</span>
        </div>
      </div>
    </div>
  );
};

export default RouteComparisonCard;
