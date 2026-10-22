// ──────────────────────────────────────────────
// Urban Health Monitoring System – Overview Cards
// ──────────────────────────────────────────────

import React from 'react';
import { MapPin, Wind, AlertTriangle, Activity } from 'lucide-react';
import { LocationId } from '../types';
import { useDemoState } from '../state/DemoProvider';
import { LOCATIONS, LOCATION_MAP } from '../data/locations';
import {
  getAqiCategory,
  getAqiColor,
  computeDerivedReading,
} from '../utils/analytics';

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: '#FFFFFF',
  borderRadius: 14,
  padding: '18px 20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  border: '1px solid #DCE5E8',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 600,
  color: '#536872',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  lineHeight: 1.3,
};

const valueStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 32,
  fontWeight: 700,
  color: '#162C36',
  lineHeight: 1.1,
};

const iconWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 10,
  flexShrink: 0,
};

const OverviewCards: React.FC = () => {
  const { readingsByLocation } = useDemoState();

  const locationIds = LOCATIONS.map((l) => l.id);

  // Compute derived readings for all locations
  const derivedAll = locationIds.map((id) => {
    const reading = readingsByLocation[id];
    return reading ? computeDerivedReading(reading) : null;
  });

  // Mean AQI
  const aqiValues = locationIds.map((id) => readingsByLocation[id]?.aqi ?? 0);
  const meanAqi = Math.round(
    aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length,
  );
  const meanCategory = getAqiCategory(meanAqi);
  const meanColor = getAqiColor(meanAqi);

  // Highest AQI
  let highestId: LocationId = locationIds[0];
  let highestAqi = 0;
  for (const id of locationIds) {
    const aqi = readingsByLocation[id]?.aqi ?? 0;
    if (aqi > highestAqi) {
      highestAqi = aqi;
      highestId = id;
    }
  }
  const highestLoc = LOCATION_MAP[highestId];

  // Alert count
  const alertCount = derivedAll.filter(
    (d) => d !== null && d.alertReasons.length > 0,
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Card 1: Monitored Locations */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ ...iconWrap, background: '#DFF3EF', color: '#0F766E' }}>
            <MapPin size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={labelStyle}>Monitored Locations</p>
            <p style={valueStyle}>4</p>
          </div>
        </div>
      </div>

      {/* Card 2: Mean Demo AQI */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              ...iconWrap,
              background: `${meanColor}18`,
              color: meanColor,
            }}
          >
            <Wind size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={labelStyle}>Mean Demo AQI</p>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <p style={valueStyle}>{meanAqi}</p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: meanAqi > 200 ? '#fff' : '#000',
                  background: meanColor,
                  borderRadius: 10,
                  lineHeight: '16px',
                  whiteSpace: 'nowrap',
                }}
              >
                {meanCategory}
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 11,
                color: '#536872',
                lineHeight: 1.3,
              }}
            >
              Arithmetic mean of 4 demo stations, not official city AQI
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Highest AQI */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              ...iconWrap,
              background: `${getAqiColor(highestAqi)}18`,
              color: getAqiColor(highestAqi),
            }}
          >
            <Activity size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={labelStyle}>Highest AQI</p>
            <p style={valueStyle}>{highestAqi}</p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 12,
                color: '#536872',
                lineHeight: 1.3,
              }}
            >
              {highestLoc.name}
            </p>
          </div>
        </div>
      </div>

      {/* Card 4: Locations with Alerts */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              ...iconWrap,
              background: alertCount > 0 ? '#FFF3E0' : '#DFF3EF',
              color: alertCount > 0 ? '#FF9800' : '#0F766E',
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={labelStyle}>Locations with Alerts</p>
            <p style={valueStyle}>{alertCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
