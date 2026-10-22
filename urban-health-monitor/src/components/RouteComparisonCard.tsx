// ──────────────────────────────────────────────
// Urban Health Monitoring System – Route Comparison
// ──────────────────────────────────────────────

import React from 'react';
import {
  Navigation,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useDemoState } from '../state/DemoProvider';
import { LOCATION_MAP } from '../data/locations';

const DETOUR_DESCRIPTIONS: Record<
  string,
  { directText: string; detourText: string; detourName: string; savingsText: string }
> = {
  'bagalur-cross': {
    directText: 'Traverses straight through Bagalur Cross multi-arm junction bottleneck.',
    detourText: 'Diverts South onto Central Park Bypass Avenue (y=320) past green zone.',
    detourName: 'Central Park Bypass Avenue (y=320)',
    savingsText: 'Avoided toxic industrial convergence; zero idling delay.',
  },
  'galleria-mall': {
    directText: 'Heads straight down West Link into Galleria Mall commercial parking gridlock.',
    detourText: 'Diverts East on Central Bypass then South along Central Avenue (x=480).',
    detourName: 'Central Avenue Arterial (x=480)',
    savingsText: 'Avoided mall parking spillover & pedestrian bottleneck.',
  },
  'phoenix-mall': {
    directText: 'Traverses North Arterial through Phoenix Mall service road drop-off queue.',
    detourText: 'Diverts South down Central Avenue then uses Outer East Expressway (x=880).',
    detourName: 'Outer East Expressway Bypass (x=880)',
    savingsText: 'Avoided ride-share pickup backup & delivery truck queuing.',
  },
  'hebbal-flyover': {
    directText: 'Heads straight into Hebbal Flyover approach transition bottleneck.',
    detourText: 'Diverts North up Central Avenue (x=480) across Central Bypass to Airport Link.',
    detourName: 'Central Avenue & Outer Expressway',
    savingsText: 'Avoided elevated highway ramp merge congestion.',
  },
};

export const RouteComparisonCard: React.FC = () => {
  const { readingsByLocation, activeJamLocationId } = useDemoState();
  const jammedLoc = LOCATION_MAP[activeJamLocationId];
  const reading = readingsByLocation[activeJamLocationId];

  const info =
    DETOUR_DESCRIPTIONS[activeJamLocationId] || DETOUR_DESCRIPTIONS['bagalur-cross'];

  const directAqi = reading ? Math.round(reading.aqi) : 248;
  const directNoise = reading ? reading.noiseLAeqDbA.toFixed(1) : '82.5';
  const directQueue = reading ? reading.queueLengthMetres : 220;

  // Clean detour metrics
  const detourAqi = Math.round(directAqi * 0.35); // ~75-85 AQI
  const detourNoise = (parseFloat(directNoise) - 18.5).toFixed(1); // ~64 dB
  const detourQueue = 0; // free-flowing bypass

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
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
              Adaptive Commuter Health Navigation &bull; Active Bottleneck Analysis
            </h3>
            <span style={{ fontSize: 12, color: '#536872' }}>
              Real-time exposure avoidance when {jammedLoc ? jammedLoc.name : 'hotspot'} is jammed
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            background: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            padding: '4px 10px',
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <TrendingDown size={14} /> -65% Exposure Avoided
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
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#991B1B' }}>
            <AlertOctagon size={16} />
            <strong style={{ fontSize: 13 }}>
              Direct Path (Abandoned &bull; {jammedLoc ? jammedLoc.stationLabel : ''})
            </strong>
          </div>
          <div style={{ fontSize: 12, color: '#7F1D1D', lineHeight: 1.4 }}>
            {info.directText}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Inhaled AQI:</span>
              <strong style={{ color: '#991B1B' }}>{directAqi} (Severe / Toxic)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Acoustic Noise:</span>
              <strong style={{ color: '#991B1B' }}>{directNoise} dB(A) (Loud)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#7F1D1D' }}>Junction Queue:</span>
              <strong style={{ color: '#991B1B' }}>{directQueue} m bottleneck</strong>
            </div>
          </div>
        </div>

        {/* Clean Detour Path */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
            <CheckCircle2 size={16} />
            <strong style={{ fontSize: 13 }}>
              Adaptive Green Detour (Chosen &bull; {info.detourName})
            </strong>
          </div>
          <div style={{ fontSize: 12, color: '#14532D', lineHeight: 1.4 }}>
            {info.detourText}
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
              <strong style={{ color: '#166534' }}>{detourQueue} m (Continuous flow)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        style={{
          background: '#F8FAFC',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#334155',
          border: '1px solid #E2E8F0',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldAlert size={15} color="#0F766E" />
          <span>
            <strong>Real-Time Decision Impact:</strong> {info.savingsText}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0F766E', fontWeight: 700 }}>
          <Clock size={14} />
          <span>Commute: ~4 to 7 min saved</span>
        </div>
      </div>
    </div>
  );
};

export default RouteComparisonCard;
