// ──────────────────────────────────────────────
// Urban Health Monitoring System – City Grid Map
// ──────────────────────────────────────────────

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LocationId, MapLayer, Reading } from '../types';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { LOCATIONS } from '../data/locations';
import { MAP_LAYER_CONFIGS } from '../config/metrics';
import {
  getAqiColor,
  getAqiCategory,
  getBandColor,
  getBandCategory,
  computeDerivedReading,
} from '../utils/analytics';
import { AlertTriangle, Navigation, ShieldCheck, TrendingDown, Eye, EyeOff } from 'lucide-react';

/** Get the display value for a location on the active layer. */
function getMarkerValue(
  reading: Reading | undefined,
  layer: MapLayer,
): { value: string; color: string; category: string; unit: string } {
  if (!reading) {
    return { value: '—', color: '#999', category: '', unit: '' };
  }

  const config = MAP_LAYER_CONFIGS[layer];

  if (layer === 'aqi') {
    const val = reading.aqi;
    return {
      value: String(Math.round(val)),
      color: getAqiColor(val),
      category: getAqiCategory(val),
      unit: '',
    };
  }

  if (layer === 'stress') {
    const derived = computeDerivedReading(reading);
    const val = derived.urbanStressIndex;
    const cat = getBandCategory(val, 'stress');
    return {
      value: String(Math.round(val)),
      color: getBandColor(cat),
      category: cat,
      unit: '',
    };
  }

  // Other layers use band colors
  const val = config.accessor(reading);
  const bandMetric = layer as 'noise' | 'pm25' | 'pm10' | 'traffic';
  const cat = getBandCategory(val, bandMetric);
  return {
    value: config.format(val),
    color: getBandColor(cat),
    category: cat,
    unit: config.unit,
  };
}

// ── Commuter Route Waypoints & Path Segments ──
interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  angle: number;
  status: string;
  phase: 'approaching' | 'alert' | 'detour' | 'clean' | 'arrived' | 'looping';
  exposureSaved: string;
}

const SEGMENTS: Segment[] = [
  // 1. West road to Alert point (before Bagalur Cross)
  {
    x1: 60,
    y1: 180,
    x2: 175,
    y2: 180,
    length: 115,
    angle: 0,
    status: 'Commuter riding East towards North Arterial',
    phase: 'approaching',
    exposureSaved: 'Scanning road telemetry...',
  },
  // 2. Alert & Divert South onto Central Bypass
  {
    x1: 175,
    y1: 180,
    x2: 175,
    y2: 320,
    length: 140,
    angle: 90,
    status: '⚠️ ALERT: Bagalur Cross AQI 248! Abandons direct route, turning South',
    phase: 'alert',
    exposureSaved: 'Hazard avoided 65m ahead',
  },
  // 3. Central Park Clean Bypass (Cruising past green zone)
  {
    x1: 175,
    y1: 320,
    x2: 720,
    y2: 320,
    length: 545,
    angle: 0,
    status: '🌿 Cruising clean Central Park Bypass Avenue (-65% pollution)',
    phase: 'clean',
    exposureSaved: 'AQI reduced from 248 → 78',
  },
  // 4. Connecting North to East Hub / Phoenix Mall
  {
    x1: 720,
    y1: 320,
    x2: 720,
    y2: 180,
    length: 140,
    angle: 270,
    status: 'Connecting North to East Destination (Phoenix Mall)',
    phase: 'detour',
    exposureSaved: 'Noise reduced: -18.5 dB(A)',
  },
  // 5. Arrival at East Hub
  {
    x1: 720,
    y1: 180,
    x2: 930,
    y2: 180,
    length: 210,
    angle: 0,
    status: '✅ Safely arrived at East Terminal! Zero congestion delay',
    phase: 'arrived',
    exposureSaved: 'Trip Exposure Protection: 65%',
  },
  // 6. Transition South for seamless continuous loop
  {
    x1: 930,
    y1: 180,
    x2: 930,
    y2: 460,
    length: 280,
    angle: 90,
    status: 'Looping via East Perimeter Road...',
    phase: 'looping',
    exposureSaved: 'Continuous commute cycle',
  },
  // 7. South Parkway westbound (Passing clean Hebbal Flyover)
  {
    x1: 930,
    y1: 460,
    x2: 60,
    y2: 460,
    length: 870,
    angle: 180,
    status: 'Passing Hebbal Flyover entry (UHMS-04, Cleanest hotspot)',
    phase: 'looping',
    exposureSaved: 'Continuous commute cycle',
  },
  // 8. Connecting back North to Origin to repeat loop
  {
    x1: 60,
    y1: 460,
    x2: 60,
    y2: 180,
    length: 280,
    angle: 270,
    status: 'Returning to West Corridor • Restarting cycle',
    phase: 'looping',
    exposureSaved: 'Continuous commute cycle',
  },
];

const TOTAL_PATH_LENGTH = SEGMENTS.reduce((sum, s) => sum + s.length, 0);

export const CityGridMap: React.FC = () => {
  const { readingsByLocation, activeMapLayer, selectedLocationId, isPlaying } =
    useDemoState();
  const dispatch = useDemoDispatch();

  // Commuter route layer toggle
  const [showCommuterRoute, setShowCommuterRoute] = useState(true);

  // Bike position animation state (0 to 1 progress along full loop)
  const [bikeProgress, setBikeProgress] = useState(0.04);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Animate bike continuously while isPlaying is true
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    // Complete loop in approx 18 seconds (140 units/sec)
    const SPEED = 1 / 18; // 1 full loop every 18 seconds

    const stepAnim = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        setBikeProgress((prev) => (prev + deltaSec * SPEED) % 1);
      }
      lastTimeRef.current = timestamp;
      animRef.current = requestAnimationFrame(stepAnim);
    };

    animRef.current = requestAnimationFrame(stepAnim);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  // Interpolate bike position and angle from progress
  const bikeState = useMemo(() => {
    const targetDist = bikeProgress * TOTAL_PATH_LENGTH;
    let accumulated = 0;

    for (const seg of SEGMENTS) {
      if (accumulated + seg.length >= targetDist) {
        const segProgress = (targetDist - accumulated) / seg.length;
        const x = seg.x1 + (seg.x2 - seg.x1) * segProgress;
        const y = seg.y1 + (seg.y2 - seg.y1) * segProgress;
        return {
          x,
          y,
          angle: seg.angle,
          status: seg.status,
          phase: seg.phase,
          exposureSaved: seg.exposureSaved,
        };
      }
      accumulated += seg.length;
    }

    const last = SEGMENTS[SEGMENTS.length - 1];
    return {
      x: last.x2,
      y: last.y2,
      angle: last.angle,
      status: last.status,
      phase: last.phase,
      exposureSaved: last.exposureSaved,
    };
  }, [bikeProgress]);

  // Roads layout
  const hRoads = [
    { y: 167, h: 26, name: 'North Arterial (y=180)' },
    { y: 307, h: 26, name: 'Central Park Bypass (y=320)' },
    { y: 447, h: 26, name: 'South Parkway (y=460)' },
  ];
  const vRoads = [
    { x: 227, w: 26, name: 'West Link (x=240)' },
    { x: 467, w: 26, name: 'Central Avenue (x=480)' },
    { x: 707, w: 26, name: 'East Corridor (x=720)' },
  ];

  // Additional connector road for the safe detour (at x=175)
  const detourConnector = { x: 167, w: 20, y: 180, h: 140 };

  // City blocks
  const blocks = useMemo(() => {
    const b: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    const xStarts = [0, 253, 493, 733];
    const xEnds = [227, 467, 707, 1000];
    const yStarts = [0, 193, 333, 473];
    const yEnds = [167, 307, 447, 640];

    for (let i = 0; i < xStarts.length; i++) {
      for (let j = 0; j < yStarts.length; j++) {
        const isEdge = i === 0 || i === xStarts.length - 1 || j === 0 || j === yStarts.length - 1;
        b.push({
          x: xStarts[i],
          y: yStarts[j],
          w: xEnds[i] - xStarts[i],
          h: yEnds[j] - yStarts[j],
          fill: isEdge ? '#F0F4F6' : '#EDF2F4',
        });
      }
    }
    return b;
  }, []);

  // Parks
  const parks = [
    { x: 280, y: 345, w: 170, h: 90, label: 'Central Green Eco-Park' },
    { x: 520, y: 205, w: 170, h: 85, label: 'North Botanical Reserve' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Commuter Telemetry HUD Banner */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 10,
          border: '1px solid #DCE5E8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: bikeState.phase === 'alert' ? '#FEF2F2' : '#DFF3EF',
              color: bikeState.phase === 'alert' ? '#DC2626' : '#0F766E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: bikeState.phase === 'alert' ? '2px solid #F87171' : '2px solid #0F766E',
              animation: isPlaying ? 'pulse 2s infinite' : 'none',
            }}
          >
            <Navigation size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 13, color: '#162C36' }}>
                Live Commuter Telemetry:
              </strong>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 8px',
                  borderRadius: 10,
                  background: bikeState.phase === 'alert' ? '#FEE2E2' : '#ECFDF5',
                  color: bikeState.phase === 'alert' ? '#B91C1C' : '#047857',
                }}
              >
                {bikeState.phase === 'alert' ? '⚠️ Rerouting Alert' : 'Active Safe Detour'}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#334155' }}>
              {bikeState.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: '#059669',
              background: '#F0FDF4',
              padding: '4px 10px',
              borderRadius: 8,
              border: '1px solid #BBF7D0',
            }}
          >
            <TrendingDown size={14} />
            <span>{bikeState.exposureSaved}</span>
          </div>

          <button
            onClick={() => setShowCommuterRoute(!showCommuterRoute)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: 12,
              fontWeight: 500,
              color: '#536872',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            title="Toggle Commuter Biker Route & Overlay"
          >
            {showCommuterRoute ? <Eye size={13} /> : <EyeOff size={13} />}
            {showCommuterRoute ? 'Hide Commuter Path' : 'Show Commuter Path'}
          </button>
        </div>
      </div>

      {/* Main Map Canvas Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: '#F4F7F8',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid #DCE5E8',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <svg
          viewBox="0 0 1000 640"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-hidden="true"
        >
          {/* Base Background */}
          <rect width="1000" height="640" fill="#F4F7F8" />

          {/* Grid lines */}
          {Array.from({ length: 26 }, (_, i) => (
            <line
              key={`vg-${i}`}
              x1={i * 40}
              y1={0}
              x2={i * 40}
              y2={640}
              stroke="#E8EEF0"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 17 }, (_, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={i * 40}
              x2={1000}
              y2={i * 40}
              stroke="#E8EEF0"
              strokeWidth={0.5}
            />
          ))}

          {/* City blocks */}
          {blocks.map((b, i) => (
            <rect
              key={`block-${i}`}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={b.fill}
            />
          ))}

          {/* Parks with Trees */}
          {parks.map((p, i) => (
            <g key={`park-${i}`}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                fill="#D4EDDA"
                rx={10}
              />
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#2E7D32"
                fontSize={10}
                fontWeight={600}
                opacity={0.7}
              >
                🌳 {p.label}
              </text>
            </g>
          ))}

          {/* Roads - Vertical */}
          {vRoads.map((r, i) => (
            <g key={`vr-${i}`}>
              <rect x={r.x} y={0} width={r.w} height={640} fill="#E2E8EA" />
              <line
                x1={r.x + r.w / 2}
                y1={0}
                x2={r.x + r.w / 2}
                y2={640}
                stroke="#CAD4D7"
                strokeWidth={1}
                strokeDasharray="8 8"
              />
            </g>
          ))}

          {/* Roads - Horizontal */}
          {hRoads.map((r, i) => (
            <g key={`hr-${i}`}>
              <rect x={0} y={r.y} width={1000} height={r.h} fill="#E2E8EA" />
              <line
                x1={0}
                y1={r.y + r.h / 2}
                x2={1000}
                y2={r.y + r.h / 2}
                stroke="#CAD4D7"
                strokeWidth={1}
                strokeDasharray="8 8"
              />
            </g>
          ))}

          {/* Detour Connector Road */}
          <rect
            x={detourConnector.x}
            y={detourConnector.y}
            width={detourConnector.w}
            height={detourConnector.h}
            fill="#E2E8EA"
          />
          <line
            x1={detourConnector.x + detourConnector.w / 2}
            y1={detourConnector.y}
            x2={detourConnector.x + detourConnector.w / 2}
            y2={detourConnector.y + detourConnector.h}
            stroke="#CAD4D7"
            strokeWidth={1}
            strokeDasharray="6 6"
          />

          {/* Subtle Road Labels */}
          <text x={80} y={160} fill="#64748B" fontSize={9} fontWeight={600}>
            NORTH ARTERIAL (y=180)
          </text>
          <text x={280} y={300} fill="#059669" fontSize={9} fontWeight={700}>
            CENTRAL PARK BYPASS (CLEAN DETOUR AVENUE, y=320)
          </text>
          <text x={80} y={440} fill="#64748B" fontSize={9} fontWeight={600}>
            SOUTH PARKWAY (y=460)
          </text>

          {/* ── COMMUTER ROUTE VISUALIZATION ── */}
          {showCommuterRoute && (
            <g>
              {/* 1. ABANDONED DIRECT ROUTE (Drawn in Bold Red Dashed with Hazard Glow) */}
              {/* Glow filter under red path */}
              <line
                x1={175}
                y1={180}
                x2={480}
                y2={180}
                stroke="rgba(239, 68, 68, 0.25)"
                strokeWidth={14}
                strokeLinecap="round"
              />
              {/* Dashed red abandoned line */}
              <line
                x1={175}
                y1={180}
                x2={480}
                y2={180}
                stroke="#DC2626"
                strokeWidth={4}
                strokeDasharray="7 5"
                strokeLinecap="round"
              />

              {/* Hazard Barrier at Bagalur Entry (x=205, y=180) */}
              <circle cx={205} cy={180} r={10} fill="#DC2626" />
              <text
                x={205}
                y={183}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={10}
                fontWeight={900}
              >
                ✕
              </text>

              {/* Abandoned Route Floating Banner */}
              <g transform="translate(205, 135)">
                <rect
                  x={-75}
                  y={0}
                  width={150}
                  height={22}
                  rx={6}
                  fill="#FEF2F2"
                  stroke="#DC2626"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={14}
                  textAnchor="middle"
                  fill="#991B1B"
                  fontSize={9}
                  fontWeight={700}
                >
                  🛑 ABANDONED DIRECT PATH
                </text>
                <text
                  x={0}
                  y={32}
                  textAnchor="middle"
                  fill="#DC2626"
                  fontSize={8}
                  fontWeight={600}
                >
                  Bagalur Hazard: AQI 248 • 82.5 dB
                </text>
              </g>

              {/* 2. ADAPTIVE GREEN DETOUR ROUTE (Vibrant Teal/Green with Arrows) */}
              {/* Glow under clean path */}
              <path
                d="M 60 180 L 175 180 L 175 320 L 720 320 L 720 180 L 930 180 L 930 460 L 60 460 Z"
                fill="none"
                stroke="rgba(16, 185, 129, 0.22)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Main clean route line */}
              <path
                d="M 60 180 L 175 180 L 175 320 L 720 320 L 720 180 L 930 180 L 930 460 L 60 460 Z"
                fill="none"
                stroke="#059669"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Clean Route Floating Banner */}
              <g transform="translate(480, 345)">
                <rect
                  x={-110}
                  y={0}
                  width={220}
                  height={20}
                  rx={6}
                  fill="#ECFDF5"
                  stroke="#10B981"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={13}
                  textAnchor="middle"
                  fill="#065F46"
                  fontSize={9}
                  fontWeight={700}
                >
                  🌿 ADAPTIVE CLEAN DETOUR (-65% POLLUTION)
                </text>
              </g>

              {/* 3. THE PERSON ON BIKE / MOTORCYCLE (Animated) */}
              <g transform={`translate(${bikeState.x}, ${bikeState.y})`}>
                {/* Dynamic Radar Sonar Wave */}
                <circle
                  cx={0}
                  cy={0}
                  r={bikeState.phase === 'alert' ? 24 : 18}
                  fill={bikeState.phase === 'alert' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}
                  stroke={bikeState.phase === 'alert' ? '#EF4444' : '#10B981'}
                  strokeWidth={1.5}
                />

                {/* Motorbike Body Rotated to Facing Direction */}
                <g transform={`rotate(${bikeState.angle})`}>
                  {/* Forward Headlamp Light Cone */}
                  <polygon
                    points="12,0 42,-14 42,14"
                    fill="rgba(254, 240, 138, 0.45)"
                  />

                  {/* Rear Wheel */}
                  <circle cx={-11} cy={0} r={4.5} fill="#1E293B" stroke="#94A3B8" strokeWidth={1} />
                  {/* Front Wheel */}
                  <circle cx={11} cy={0} r={4.5} fill="#1E293B" stroke="#94A3B8" strokeWidth={1} />
                  {/* Motorcycle Chassis Frame */}
                  <path
                    d="M -11 0 L -3 -5 L 5 -5 L 11 0 Z"
                    fill="#0F766E"
                    stroke="#042F2E"
                    strokeWidth={1}
                  />
                  {/* Handlebars */}
                  <line x1={7} y1={-6} x2={7} y2={6} stroke="#0F172A" strokeWidth={2} strokeLinecap="round" />

                  {/* RIDER (Person on Bike) */}
                  {/* Torso/Jacket leaning forward */}
                  <ellipse cx={-1} cy={0} rx={5} ry={3.5} fill="#334155" />
                  {/* Helmet Head with Visor */}
                  <circle cx={2} cy={0} r={4.5} fill="#FFFFFF" stroke="#0F766E" strokeWidth={1.5} />
                  {/* Visor slit facing forward */}
                  <path d="M 4 -2.5 A 3 3 0 0 1 4 2.5 Z" fill="#0F172A" />
                </g>

                {/* Floating Rider Status Tooltip */}
                <g transform="translate(0, -28)">
                  <rect
                    x={-45}
                    y={0}
                    width={90}
                    height={18}
                    rx={6}
                    fill="#1E293B"
                    opacity={0.92}
                  />
                  <text
                    x={0}
                    y={12}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={9}
                    fontWeight={700}
                  >
                    🏍️ Commuter
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* Decorative Intersection Rings */}
          <circle cx={240} cy={180} r={18} fill="none" stroke="rgba(220, 38, 38, 0.4)" strokeWidth={2} strokeDasharray="3 3" />
          <circle cx={720} cy={180} r={16} fill="none" stroke="#CAD4D7" strokeWidth={1} />
          <circle cx={240} cy={460} r={16} fill="none" stroke="#CAD4D7" strokeWidth={1} />
          <circle cx={720} cy={460} r={16} fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth={2} />
        </svg>

        {/* ── HTML STATION MARKERS (Accessible Buttons Overlaid) ── */}
        {LOCATIONS.map((loc, idx) => {
          const reading = readingsByLocation[loc.id];
          const marker = getMarkerValue(reading, activeMapLayer);
          const isSelected = selectedLocationId === loc.id;

          const leftPct = (loc.position.x / 1000) * 100;
          const topPct = (loc.position.y / 640) * 100;

          // Rank label
          const rankLabels = ['#1 Worst', '#2 Elevated', '#3 Moderate', '#4 Cleanest'];

          return (
            <button
              key={loc.id}
              role="button"
              aria-label={`${loc.name}: ${marker.value}${marker.unit ? ' ' + marker.unit : ''} (${marker.category}). Click to inspect.`}
              title={`${loc.name}\n${MAP_LAYER_CONFIGS[activeMapLayer].label}: ${marker.value}${marker.unit ? ' ' + marker.unit : ''}\nStatus: ${rankLabels[idx]}`}
              onClick={() =>
                dispatch({
                  type: 'SELECT_LOCATION',
                  locationId: loc.id,
                })
              }
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 10,
                outline: 'none',
              }}
            >
              {/* Outer Selection Highlight Ring */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: `${marker.color}33`,
                    border: `2px solid ${marker.color}`,
                    top: -5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Station Rank Badge */}
              <span
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -8,
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: idx === 0 ? '#DC2626' : '#162C36',
                  borderRadius: 6,
                  padding: '1px 5px',
                  lineHeight: '14px',
                  zIndex: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                {rankLabels[idx]}
              </span>

              {/* Main Station Marker Circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: '50%',
                  background: marker.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? '3px solid #0F766E' : '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.15s ease',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    lineHeight: 1,
                  }}
                >
                  {marker.value}
                </span>
              </div>

              {/* Location Name Label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#162C36',
                  background: 'rgba(255,255,255,0.94)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  maxWidth: 125,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: isSelected ? '1px solid #0F766E' : '1px solid #E2E8F0',
                }}
              >
                {loc.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanatory Map Caption */}
      <p
        style={{
          margin: '8px 0 0',
          fontSize: 12,
          fontStyle: 'italic',
          color: '#536872',
          textAlign: 'center',
        }}
      >
        Illustrative grid — positions are fictional &bull; Dynamic commuter rerouting loop simulates real-time environmental avoidance
      </p>
    </div>
  );
};

export default CityGridMap;
