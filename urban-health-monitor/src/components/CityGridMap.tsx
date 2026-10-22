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
import {
  Navigation,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

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

// ── Path Segment Interface ──
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

interface CommuteCycleConfig {
  title: string;
  jammedName: string;
  jammedReason: string;
  detourName: string;
  abandonedLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    barrierX: number;
    barrierY: number;
    label: string;
    subLabel: string;
  };
  detourPathSvg: string;
  segments: Segment[];
}

// ── 4 DYNAMIC COMMUTE CYCLES (Each Hotspot Gets Jammed in Sequence) ──
const COMMUTE_CYCLES: Record<LocationId, CommuteCycleConfig> = {
  // ── CYCLE 1: Bagalur Cross Jammed (Top-Left) ──
  'bagalur-cross': {
    title: 'Round 1: Bagalur Cross Jammed (AQI 248, 82.5 dB)',
    jammedName: 'Bagalur Cross',
    jammedReason: 'Severe multi-arm freight & transit convergence',
    detourName: 'Central Park Bypass Avenue (y=320)',
    abandonedLine: {
      x1: 175,
      y1: 180,
      x2: 480,
      y2: 180,
      barrierX: 205,
      barrierY: 180,
      label: '🛑 ABANDONED DIRECT PATH',
      subLabel: 'Bagalur Cross: AQI 248 • 82.5 dB(A)',
    },
    detourPathSvg:
      'M 60 180 L 175 180 L 175 320 L 720 320 L 720 180 L 880 180 L 880 460 L 60 460 Z',
    segments: [
      {
        x1: 60,
        y1: 180,
        x2: 175,
        y2: 180,
        length: 115,
        angle: 0,
        status: 'Riding East on North Arterial toward Bagalur...',
        phase: 'approaching',
        exposureSaved: 'Telemetry monitoring active',
      },
      {
        x1: 175,
        y1: 180,
        x2: 175,
        y2: 320,
        length: 140,
        angle: 90,
        status: '⚠️ ALERT: Bagalur Cross Jammed (AQI 248)! Diverting South to Central Bypass',
        phase: 'alert',
        exposureSaved: 'Avoided toxic junction 65m ahead',
      },
      {
        x1: 175,
        y1: 320,
        x2: 720,
        y2: 320,
        length: 545,
        angle: 0,
        status: '🌿 Cruising clean Central Park Bypass (AQI ~75, Calm 62 dB)',
        phase: 'clean',
        exposureSaved: 'Pollution exposure: -65%',
      },
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
      {
        x1: 720,
        y1: 180,
        x2: 880,
        y2: 180,
        length: 160,
        angle: 0,
        status: '✅ Safely arrived at East Sector! Protected from pollution',
        phase: 'arrived',
        exposureSaved: 'Trip Protection: Optimal (A+)',
      },
      {
        x1: 880,
        y1: 180,
        x2: 880,
        y2: 460,
        length: 280,
        angle: 90,
        status: 'Transitioning via Outer East Expressway...',
        phase: 'looping',
        exposureSaved: 'Continuous commute tracking',
      },
      {
        x1: 880,
        y1: 460,
        x2: 60,
        y2: 460,
        length: 820,
        angle: 180,
        status: 'Returning via South Parkway past Hebbal (Clean corridor)',
        phase: 'looping',
        exposureSaved: 'Continuous commute tracking',
      },
      {
        x1: 60,
        y1: 460,
        x2: 60,
        y2: 180,
        length: 280,
        angle: 270,
        status: 'West Link transition • Loop cycle completing',
        phase: 'looping',
        exposureSaved: 'Continuous commute tracking',
      },
    ],
  },

  // ── CYCLE 2: Galleria Mall Jammed (Bottom-Left) ──
  'galleria-mall': {
    title: 'Round 2: Near Galleria Mall Jammed (AQI 252, 83.5 dB)',
    jammedName: 'Near Galleria Mall',
    jammedReason: 'Commercial shopping parking gridlock & idling emissions',
    detourName: 'Central Avenue Arterial (x=480)',
    abandonedLine: {
      x1: 240,
      y1: 320,
      x2: 240,
      y2: 460,
      barrierX: 240,
      barrierY: 390,
      label: '🛑 ABANDONED DIRECT PATH',
      subLabel: 'Galleria Mall Gridlock: AQI 252 • 83.5 dB(A)',
    },
    detourPathSvg:
      'M 240 180 L 240 320 L 480 320 L 480 460 L 880 460 L 880 180 Z',
    segments: [
      {
        x1: 240,
        y1: 180,
        x2: 240,
        y2: 320,
        length: 140,
        angle: 90,
        status: 'Heading South on West Link toward Galleria...',
        phase: 'approaching',
        exposureSaved: 'Telemetry scanning ahead',
      },
      {
        x1: 240,
        y1: 320,
        x2: 480,
        y2: 320,
        length: 240,
        angle: 0,
        status: '⚠️ ALERT: Galleria Mall Gridlock (AQI 252)! Diverting East on Central Bypass',
        phase: 'alert',
        exposureSaved: 'Avoided commercial idling bottleneck',
      },
      {
        x1: 480,
        y1: 320,
        x2: 480,
        y2: 460,
        length: 140,
        angle: 90,
        status: '🌿 Taking Central Avenue South past Botanical Reserve',
        phase: 'clean',
        exposureSaved: 'Zero queue delay • -68% toxic smoke',
      },
      {
        x1: 480,
        y1: 460,
        x2: 880,
        y2: 460,
        length: 400,
        angle: 0,
        status: '✅ South Parkway transit cleanly connects to Hebbal Flyover',
        phase: 'arrived',
        exposureSaved: 'Noise strain: -20 dB(A)',
      },
      {
        x1: 880,
        y1: 460,
        x2: 880,
        y2: 180,
        length: 280,
        angle: 270,
        status: 'Returning via Outer East Expressway...',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
      {
        x1: 880,
        y1: 180,
        x2: 240,
        y2: 180,
        length: 640,
        angle: 180,
        status: 'North corridor return • Loop cycle completing',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
    ],
  },

  // ── CYCLE 3: Phoenix Mall Jammed (Top-Right) ──
  'phoenix-mall': {
    title: 'Round 3: Phoenix Mall Entry Jammed (AQI 246, 82 dB)',
    jammedName: 'Phoenix Mall of Asia',
    jammedReason: 'Mall entry/exit service road ride-share queue spillover',
    detourName: 'Central Bypass & Outer East Expressway',
    abandonedLine: {
      x1: 480,
      y1: 180,
      x2: 720,
      y2: 180,
      barrierX: 600,
      barrierY: 180,
      label: '🛑 ABANDONED DIRECT PATH',
      subLabel: 'Phoenix Mall Spillover: AQI 246 • 215m Queue',
    },
    detourPathSvg:
      'M 240 180 L 480 180 L 480 320 L 880 320 L 880 180 L 880 460 L 240 460 Z',
    segments: [
      {
        x1: 240,
        y1: 180,
        x2: 480,
        y2: 180,
        length: 240,
        angle: 0,
        status: 'Riding East on North Arterial toward Phoenix Mall...',
        phase: 'approaching',
        exposureSaved: 'Monitoring mall perimeter',
      },
      {
        x1: 480,
        y1: 180,
        x2: 480,
        y2: 320,
        length: 140,
        angle: 90,
        status: '⚠️ ALERT: Phoenix Mall Service Road Blocked! Turning South down Central Ave',
        phase: 'alert',
        exposureSaved: 'Avoided 215m service road queue',
      },
      {
        x1: 480,
        y1: 320,
        x2: 880,
        y2: 320,
        length: 400,
        angle: 0,
        status: '🌿 Cruising clean Central Bypass Avenue to Outer Expressway',
        phase: 'clean',
        exposureSaved: 'Air exposure: -60%',
      },
      {
        x1: 880,
        y1: 320,
        x2: 880,
        y2: 180,
        length: 140,
        angle: 270,
        status: '✅ Arriving at East Terminal bypassing the entire mall backup',
        phase: 'arrived',
        exposureSaved: 'Saved 8 minutes vehicle idling delay',
      },
      {
        x1: 880,
        y1: 180,
        x2: 880,
        y2: 460,
        length: 280,
        angle: 90,
        status: 'Returning via Outer Expressway South...',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
      {
        x1: 880,
        y1: 460,
        x2: 240,
        y2: 460,
        length: 640,
        angle: 180,
        status: 'South Parkway westbound...',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
      {
        x1: 240,
        y1: 460,
        x2: 240,
        y2: 180,
        length: 280,
        angle: 270,
        status: 'Returning to North Corridor',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
    ],
  },

  // ── CYCLE 4: Hebbal Flyover Jammed (Bottom-Right) ──
  'hebbal-flyover': {
    title: 'Round 4: Hebbal Flyover Approach Jammed (AQI 242, 81.5 dB)',
    jammedName: 'Hebbal Flyover entry',
    jammedReason: 'Highway flyover ramp bottleneck & stop-and-go congestion',
    detourName: 'Central Avenue & Outer East Expressway Bypass',
    abandonedLine: {
      x1: 480,
      y1: 460,
      x2: 720,
      y2: 460,
      barrierX: 600,
      barrierY: 460,
      label: '🛑 ABANDONED DIRECT PATH',
      subLabel: 'Hebbal Flyover Ramp Jam: AQI 242 • 81.5 dB(A)',
    },
    detourPathSvg:
      'M 240 460 L 480 460 L 480 320 L 880 320 L 880 460 L 880 180 L 240 180 Z',
    segments: [
      {
        x1: 240,
        y1: 460,
        x2: 480,
        y2: 460,
        length: 240,
        angle: 0,
        status: 'Riding East on South Parkway toward Hebbal Flyover...',
        phase: 'approaching',
        exposureSaved: 'Monitoring flyover ramp',
      },
      {
        x1: 480,
        y1: 460,
        x2: 480,
        y2: 320,
        length: 140,
        angle: 270,
        status: '⚠️ ALERT: Hebbal Flyover Approach Gridlock! Diverting North up Central Ave',
        phase: 'alert',
        exposureSaved: 'Avoided flyover ramp backup',
      },
      {
        x1: 480,
        y1: 320,
        x2: 880,
        y2: 320,
        length: 400,
        angle: 0,
        status: '🌿 Clean Central Bypass to Outer Expressway (AQI 72)',
        phase: 'clean',
        exposureSaved: 'Pollution exposure: -62%',
      },
      {
        x1: 880,
        y1: 320,
        x2: 880,
        y2: 460,
        length: 140,
        angle: 90,
        status: '✅ Seamless connection to South-East destination past the bottleneck',
        phase: 'arrived',
        exposureSaved: 'Free-flow velocity preserved: 34 km/h',
      },
      {
        x1: 880,
        y1: 460,
        x2: 880,
        y2: 180,
        length: 280,
        angle: 270,
        status: 'Outer Expressway northbound...',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
      {
        x1: 880,
        y1: 180,
        x2: 240,
        y2: 180,
        length: 640,
        angle: 180,
        status: 'North Arterial return...',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
      {
        x1: 240,
        y1: 180,
        x2: 240,
        y2: 460,
        length: 280,
        angle: 90,
        status: 'Returning to South Parkway to repeat cycle',
        phase: 'looping',
        exposureSaved: 'Loop continuous',
      },
    ],
  },
};

export const CityGridMap: React.FC = () => {
  const {
    readingsByLocation,
    activeMapLayer,
    selectedLocationId,
    activeJamLocationId,
    isPlaying,
  } = useDemoState();
  const dispatch = useDemoDispatch();

  // Commuter route layer toggle
  const [showCommuterRoute, setShowCommuterRoute] = useState(true);
  // Auto-shift toggle (automatically shift jammed location when round finishes)
  const [autoCycle, setAutoCycle] = useState(true);

  // Active cycle config based on activeJamLocationId
  const activeCycle =
    COMMUTE_CYCLES[activeJamLocationId] || COMMUTE_CYCLES['bagalur-cross'];
  const totalLength = useMemo(
    () => activeCycle.segments.reduce((acc, s) => acc + s.length, 0),
    [activeCycle],
  );

  // Bike position animation state (0 to 1 progress along full loop)
  const [bikeProgress, setBikeProgress] = useState(0.02);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const prevProgressRef = useRef<number>(0.02);

  // Animate bike continuously while isPlaying is true
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    // Complete loop in approx 16 seconds (smooth driving speed)
    const SPEED = 1 / 16;

    const stepAnim = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        setBikeProgress((prev) => {
          const next = (prev + deltaSec * SPEED) % 1;
          // When progress wraps around from near 1.0 to 0.0, advance cycle if autoCycle enabled
          if (prev > 0.95 && next < 0.1 && autoCycle) {
            dispatch({ type: 'NEXT_COMMUTE_CYCLE' });
          }
          prevProgressRef.current = next;
          return next;
        });
      }
      lastTimeRef.current = timestamp;
      animRef.current = requestAnimationFrame(stepAnim);
    };

    animRef.current = requestAnimationFrame(stepAnim);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, autoCycle, dispatch]);

  // Interpolate bike position and angle from progress for current cycle
  const bikeState = useMemo(() => {
    const targetDist = bikeProgress * totalLength;
    let accumulated = 0;

    for (const seg of activeCycle.segments) {
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

    const last = activeCycle.segments[activeCycle.segments.length - 1];
    return {
      x: last.x2,
      y: last.y2,
      angle: last.angle,
      status: last.status,
      phase: last.phase,
      exposureSaved: last.exposureSaved,
    };
  }, [bikeProgress, totalLength, activeCycle]);

  // ── MULTIPLE INTERCONNECTED ROADS (Grid Network) ──
  // Horizontal Avenues:
  const hRoads = [
    { y: 167, h: 26, name: 'North Arterial (y=180)' },
    { y: 307, h: 26, name: 'Central Park Bypass Avenue (y=320)' },
    { y: 447, h: 26, name: 'South Parkway (y=460)' },
  ];

  // Vertical Corridors & Cross Streets:
  const vRoads = [
    { x: 87, w: 22, name: 'Outer West Lane (x=100)' },
    { x: 165, w: 20, name: 'West Connector Link (x=175)' },
    { x: 227, w: 26, name: 'West Link Corridor (x=240)' },
    { x: 348, w: 22, name: 'Mid-West Eco Avenue (x=360)' },
    { x: 467, w: 26, name: 'Central Avenue Arterial (x=480)' },
    { x: 588, w: 22, name: 'Mid-East Botanical Link (x=600)' },
    { x: 707, w: 26, name: 'East Corridor (x=720)' },
    { x: 868, w: 24, name: 'Outer East Expressway (x=880)' },
  ];

  // City blocks
  const blocks = useMemo(() => {
    const b: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    const xRanges = [
      { x1: 0, x2: 87 },
      { x1: 109, x2: 165 },
      { x1: 185, x2: 227 },
      { x1: 253, x2: 348 },
      { x1: 370, x2: 467 },
      { x1: 493, x2: 588 },
      { x1: 610, x2: 707 },
      { x1: 733, x2: 868 },
      { x1: 892, x2: 1000 },
    ];
    const yRanges = [
      { y1: 0, y2: 167 },
      { y1: 193, y2: 307 },
      { y1: 333, y2: 447 },
      { y1: 473, y2: 640 },
    ];

    for (let i = 0; i < xRanges.length; i++) {
      for (let j = 0; j < yRanges.length; j++) {
        const isEdge = i === 0 || i === xRanges.length - 1 || j === 0 || j === yRanges.length - 1;
        b.push({
          x: xRanges[i].x1,
          y: yRanges[j].y1,
          w: xRanges[i].x2 - xRanges[i].x1,
          h: yRanges[j].y2 - yRanges[j].y1,
          fill: isEdge ? '#F1F5F7' : '#EDF2F4',
        });
      }
    }
    return b;
  }, []);

  // Parks
  const parks = [
    { x: 260, y: 340, w: 200, h: 100, label: 'Central Green Eco-Park Corridor' },
    { x: 500, y: 200, w: 200, h: 95, label: 'North Botanical Wildlife Reserve' },
    { x: 740, y: 340, w: 120, h: 100, label: 'East Community Woodlands' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ── REAL-TIME COMMUTER CONTROLS & HUD ── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 10,
          border: '1px solid #DCE5E8',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Top Ticker: Active Jam & Decision Making Narrative */}
        <div
          style={{
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
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: bikeState.phase === 'alert' ? '#FEE2E2' : '#DFF3EF',
                color: bikeState.phase === 'alert' ? '#DC2626' : '#0F766E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border:
                  bikeState.phase === 'alert'
                    ? '2px solid #F87171'
                    : '2px solid #0F766E',
                animation: isPlaying ? 'pulse 2s infinite' : 'none',
              }}
            >
              <Navigation size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: '#FEF2F2',
                    color: '#B91C1C',
                    border: '1px solid #FCA5A5',
                  }}
                >
                  <Flame size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  ACTIVE JAM: {activeCycle.jammedName}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #6EE7B7',
                  }}
                >
                  <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  DETOUR: {activeCycle.detourName}
                </span>

                {autoCycle && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#0284C7',
                      background: '#E0F2FE',
                      padding: '2px 7px',
                      borderRadius: 10,
                    }}
                  >
                    Auto-Cycles On Loop Completion
                  </span>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: '#162C36', marginTop: 2 }}>
                {bikeState.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live exposure saved badge */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#047857',
                background: '#F0FDF4',
                padding: '5px 10px',
                borderRadius: 8,
                border: '1px solid #BBF7D0',
              }}
            >
              {bikeState.exposureSaved}
            </span>

            {/* Toggle route */}
            <button
              onClick={() => setShowCommuterRoute(!showCommuterRoute)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {showCommuterRoute ? <Eye size={13} /> : <EyeOff size={13} />}
              {showCommuterRoute ? 'Hide Path' : 'Show Path'}
            </button>
          </div>
        </div>

        {/* Bottom Bar: Interactive Cycle Selector so Presenter Can Switch Jammed Spot on Demand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 8,
            borderTop: '1px solid #F1F5F9',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Simulate Shifting Hotspot:
          </span>

          {([
            { id: 'bagalur-cross', label: '1. Bagalur Jam (North-West)' },
            { id: 'galleria-mall', label: '2. Galleria Jam (South-West)' },
            { id: 'phoenix-mall', label: '3. Phoenix Jam (North-East)' },
            { id: 'hebbal-flyover', label: '4. Hebbal Jam (South-East)' },
          ] as { id: LocationId; label: string }[]).map((cycle) => {
            const isActive = activeJamLocationId === cycle.id;
            return (
              <button
                key={cycle.id}
                onClick={() => {
                  dispatch({ type: 'SET_JAM_LOCATION', locationId: cycle.id });
                  setBikeProgress(0.02); // restart bike cleanly at beginning of new scenario
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#0F766E' : '#F8FAFC',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? '1px solid #0F766E' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cycle.label}
              </button>
            );
          })}

          <button
            onClick={() => setAutoCycle(!autoCycle)}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: autoCycle ? '#E0F2FE' : '#F1F5F9',
              color: autoCycle ? '#0369A1' : '#64748B',
              border: autoCycle ? '1px solid #BAE6FD' : '1px solid #CBD5E1',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            title="When active, the jammed hotspot automatically shifts on every completed round!"
          >
            <RotateCw size={12} />
            Auto-Shift: {autoCycle ? 'ON' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* ── MAIN MAP CANVAS (SVG Grid Network + Overlays) ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: '#F4F7F8',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid #DCE5E8',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <svg
          viewBox="0 0 1000 640"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-hidden="true"
        >
          {/* Base Canvas */}
          <rect width="1000" height="640" fill="#F4F7F8" />

          {/* Regular Grid Lines */}
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

          {/* Ecological Parks with Trees */}
          {parks.map((p, i) => (
            <g key={`park-${i}`}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                fill="#D4EDDA"
                rx={12}
              />
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#2E7D32"
                fontSize={10}
                fontWeight={700}
                opacity={0.8}
              >
                🌳 {p.label}
              </text>
            </g>
          ))}

          {/* ── ROAD NETWORK: VERTICAL CORRIDORS (Multiple Parallel Paths) ── */}
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

          {/* ── ROAD NETWORK: HORIZONTAL AVENUES (Multiple Parallel Paths) ── */}
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

          {/* Street Name Labels */}
          <text x={20} y={160} fill="#64748B" fontSize={8} fontWeight={700}>
            NORTH ARTERIAL (y=180)
          </text>
          <text x={260} y={300} fill="#059669" fontSize={9} fontWeight={800}>
            CENTRAL PARK BYPASS (y=320) &bull; ECO-CORRIDOR
          </text>
          <text x={20} y={440} fill="#64748B" fontSize={8} fontWeight={700}>
            SOUTH PARKWAY (y=460)
          </text>

          <text x={245} y={30} fill="#64748B" fontSize={8} fontWeight={700}>
            WEST LINK (x=240)
          </text>
          <text x={485} y={30} fill="#059669" fontSize={8} fontWeight={800}>
            CENTRAL AVE (x=480)
          </text>
          <text x={725} y={30} fill="#64748B" fontSize={8} fontWeight={700}>
            EAST CORRIDOR (x=720)
          </text>
          <text x={885} y={30} fill="#64748B" fontSize={8} fontWeight={700}>
            EXPRESSWAY (x=880)
          </text>

          {/* ── DYNAMIC COMMUTER REROUTING OVERLAY ── */}
          {showCommuterRoute && (
            <g>
              {/* 1. ABANDONED DIRECT PATH FOR CURRENT CYCLE (Red Dashed + ❌ Barrier) */}
              <line
                x1={activeCycle.abandonedLine.x1}
                y1={activeCycle.abandonedLine.y1}
                x2={activeCycle.abandonedLine.x2}
                y2={activeCycle.abandonedLine.y2}
                stroke="rgba(239, 68, 68, 0.28)"
                strokeWidth={14}
                strokeLinecap="round"
              />
              <line
                x1={activeCycle.abandonedLine.x1}
                y1={activeCycle.abandonedLine.y1}
                x2={activeCycle.abandonedLine.x2}
                y2={activeCycle.abandonedLine.y2}
                stroke="#DC2626"
                strokeWidth={4}
                strokeDasharray="7 5"
                strokeLinecap="round"
              />

              {/* Roadblock Barrier */}
              <circle
                cx={activeCycle.abandonedLine.barrierX}
                cy={activeCycle.abandonedLine.barrierY}
                r={10}
                fill="#DC2626"
              />
              <text
                x={activeCycle.abandonedLine.barrierX}
                y={activeCycle.abandonedLine.barrierY + 3.5}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={10}
                fontWeight={900}
              >
                ✕
              </text>

              {/* Abandoned Path Floating Callout */}
              <g
                transform={`translate(${activeCycle.abandonedLine.barrierX}, ${activeCycle.abandonedLine.barrierY - 32})`}
              >
                <rect
                  x={-80}
                  y={0}
                  width={160}
                  height={24}
                  rx={6}
                  fill="#FEF2F2"
                  stroke="#DC2626"
                  strokeWidth={1.5}
                />
                <text
                  x={0}
                  y={13}
                  textAnchor="middle"
                  fill="#991B1B"
                  fontSize={9}
                  fontWeight={800}
                >
                  {activeCycle.abandonedLine.label}
                </text>
                <text
                  x={0}
                  y={22}
                  textAnchor="middle"
                  fill="#DC2626"
                  fontSize={7.5}
                  fontWeight={600}
                >
                  {activeCycle.abandonedLine.subLabel}
                </text>
              </g>

              {/* 2. ADAPTIVE GREEN DETOUR ROUTE (Green Line with Animated Flow) */}
              <path
                d={activeCycle.detourPathSvg}
                fill="none"
                stroke="rgba(16, 185, 129, 0.24)"
                strokeWidth={14}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={activeCycle.detourPathSvg}
                fill="none"
                stroke="#059669"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. THE PERSON ON BIKE / MOTORCYCLE (Gliding Smoothly on the Road) */}
              <g transform={`translate(${bikeState.x}, ${bikeState.y})`}>
                {/* Dynamic Radar Wave Sensing Surrounding Telemetry */}
                <circle
                  cx={0}
                  cy={0}
                  r={bikeState.phase === 'alert' ? 26 : 18}
                  fill={
                    bikeState.phase === 'alert'
                      ? 'rgba(239, 68, 68, 0.28)'
                      : 'rgba(16, 185, 129, 0.22)'
                  }
                  stroke={bikeState.phase === 'alert' ? '#EF4444' : '#10B981'}
                  strokeWidth={1.5}
                />

                {/* Motorbike Rotated to Travel Vector */}
                <g transform={`rotate(${bikeState.angle})`}>
                  {/* Forward Headlamp Beam */}
                  <polygon
                    points="12,0 45,-14 45,14"
                    fill="rgba(254, 240, 138, 0.45)"
                  />

                  {/* Rear Wheel */}
                  <circle
                    cx={-11}
                    cy={0}
                    r={4.5}
                    fill="#1E293B"
                    stroke="#94A3B8"
                    strokeWidth={1}
                  />
                  {/* Front Wheel */}
                  <circle
                    cx={11}
                    cy={0}
                    r={4.5}
                    fill="#1E293B"
                    stroke="#94A3B8"
                    strokeWidth={1}
                  />
                  {/* Motorcycle Chassis Frame */}
                  <path
                    d="M -11 0 L -3 -5 L 5 -5 L 11 0 Z"
                    fill="#0F766E"
                    stroke="#042F2E"
                    strokeWidth={1}
                  />
                  {/* Handlebars */}
                  <line
                    x1={7}
                    y1={-6}
                    x2={7}
                    y2={6}
                    stroke="#0F172A"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />

                  {/* Rider Leaning Forward */}
                  <ellipse cx={-1} cy={0} rx={5} ry={3.5} fill="#334155" />
                  {/* Rider Helmet with Visor Facing Travel Direction */}
                  <circle
                    cx={2}
                    cy={0}
                    r={4.5}
                    fill="#FFFFFF"
                    stroke="#0F766E"
                    strokeWidth={1.5}
                  />
                  <path d="M 4 -2.5 A 3 3 0 0 1 4 2.5 Z" fill="#0F172A" />
                </g>

                {/* Floating Commuter Tooltip */}
                <g transform="translate(0, -28)">
                  <rect
                    x={-48}
                    y={0}
                    width={96}
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

          {/* Active Jam Beacon on the Map */}
          {activeJamLocationId === 'bagalur-cross' && (
            <circle cx={240} cy={180} r={22} fill="none" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="4 4" />
          )}
          {activeJamLocationId === 'galleria-mall' && (
            <circle cx={240} cy={460} r={22} fill="none" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="4 4" />
          )}
          {activeJamLocationId === 'phoenix-mall' && (
            <circle cx={720} cy={180} r={22} fill="none" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="4 4" />
          )}
          {activeJamLocationId === 'hebbal-flyover' && (
            <circle cx={720} cy={460} r={22} fill="none" stroke="#DC2626" strokeWidth={2.5} strokeDasharray="4 4" />
          )}
        </svg>

        {/* ── HTML STATION MARKERS (Accessible Interactive Buttons) ── */}
        {LOCATIONS.map((loc) => {
          const reading = readingsByLocation[loc.id];
          const marker = getMarkerValue(reading, activeMapLayer);
          const isSelected = selectedLocationId === loc.id;
          const isJammed = activeJamLocationId === loc.id;

          const leftPct = (loc.position.x / 1000) * 100;
          const topPct = (loc.position.y / 640) * 100;

          return (
            <button
              key={loc.id}
              role="button"
              aria-label={`${loc.name}: ${marker.value}${marker.unit ? ' ' + marker.unit : ''} (${marker.category}). Click to inspect.`}
              title={`${loc.name}\n${MAP_LAYER_CONFIGS[activeMapLayer].label}: ${marker.value}${marker.unit ? ' ' + marker.unit : ''}\n${isJammed ? '⚠️ ACTIVE BOTTLENECK' : 'Normal Flow'}`}
              onClick={() => {
                dispatch({
                  type: 'SELECT_LOCATION',
                  locationId: loc.id,
                });
              }}
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
                zIndex: isSelected ? 30 : isJammed ? 25 : 10,
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

              {/* Status Badge (JAMMED vs Normal) */}
              <span
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -8,
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  background: isJammed ? '#DC2626' : '#162C36',
                  borderRadius: 6,
                  padding: '1px 5px',
                  lineHeight: '14px',
                  zIndex: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                {isJammed ? '⚠️ JAMMED' : loc.stationLabel}
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
                  border: isSelected
                    ? '3px solid #0F766E'
                    : isJammed
                      ? '3px solid #DC2626'
                      : '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.15s ease',
                  transform: isSelected || isJammed ? 'scale(1.08)' : 'scale(1)',
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
                  border: isJammed
                    ? '1.5px solid #DC2626'
                    : isSelected
                      ? '1px solid #0F766E'
                      : '1px solid #E2E8F0',
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
        Illustrative grid with multiple interconnected routes &bull; Real-time simulation shifts congestion across stations to demonstrate dynamic commuter decision-making
      </p>
    </div>
  );
};

export default CityGridMap;
