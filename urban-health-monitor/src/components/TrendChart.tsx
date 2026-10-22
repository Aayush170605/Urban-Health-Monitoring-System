// ──────────────────────────────────────────────
// Urban Health Monitoring System – Trend Chart
// ──────────────────────────────────────────────

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendMetric, Reading } from '../types';
import { useDemoState, useDemoDispatch } from '../state/DemoProvider';
import { LOCATION_MAP } from '../data/locations';
import { TREND_METRIC_CONFIGS, TREND_METRIC_OPTIONS } from '../config/metrics';
import { computeUrbanStressIndex } from '../utils/analytics';
import { formatTime } from '../utils/formatting';

interface ChartPoint {
  time: string;
  timestamp: string;
  value: number;
}

export const TrendChart: React.FC = () => {
  const {
    selectedLocationId,
    activeTrendMetric,
    readingsByLocation,
    historyByLocation,
  } = useDemoState();
  const dispatch = useDemoDispatch();

  const location = LOCATION_MAP[selectedLocationId];
  const metricConfig = TREND_METRIC_CONFIGS[activeTrendMetric];

  // Build the 13 points: history plus the current reading (which is already the last item or appended)
  const chartData: ChartPoint[] = useMemo(() => {
    const rawHistory = historyByLocation[selectedLocationId] || [];
    const current = readingsByLocation[selectedLocationId];

    // Combine history and ensure current reading is the final point
    const points: Reading[] = [...rawHistory];
    if (current && (points.length === 0 || points[points.length - 1].timestamp !== current.timestamp)) {
      points.push(current);
    }

    // Keep the latest 13 points
    const latest13 = points.slice(-13);

    return latest13.map((r) => {
      let val: number;
      if (activeTrendMetric === 'stress') {
        val = computeUrbanStressIndex(r).index;
      } else {
        val = metricConfig.accessor(r);
      }

      return {
        time: formatTime(r.timestamp),
        timestamp: r.timestamp,
        value: Number(val.toFixed(metricConfig.decimals)),
      };
    });
  }, [selectedLocationId, activeTrendMetric, historyByLocation, readingsByLocation, metricConfig]);

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: 'SET_TREND_METRIC',
      metric: e.target.value as TrendMetric,
    });
  };

  return (
    <div className="trend-card">
      <div className="trend-header">
        <div>
          <h3 className="trend-title">
            Past 60 simulated minutes — {location ? location.name : ''}
          </h3>
          <span style={{ fontSize: 12, color: '#536872' }}>
            Metric: {metricConfig.label} {metricConfig.unit ? `(${metricConfig.unit})` : ''} • 13 samples at 5-min intervals
          </span>
        </div>
        <div>
          <label htmlFor="trend-metric-select" style={{ fontSize: 12, fontWeight: 600, marginRight: 8, color: '#536872' }}>
            Metric:
          </label>
          <select
            id="trend-metric-select"
            className="trend-metric-select"
            value={activeTrendMetric}
            onChange={handleMetricChange}
          >
            {TREND_METRIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        {chartData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#536872', fontStyle: 'italic' }}>
            No trend data available for this selection
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8EA" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#536872"
                fontSize={11}
                tickLine={false}
                label={{ value: 'Time (IST)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#536872' }}
              />
              <YAxis
                stroke="#536872"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                label={{
                  value: metricConfig.unit || metricConfig.shortLabel,
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 11,
                  fill: '#536872',
                }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value} ${metricConfig.unit}`.trim(),
                  metricConfig.label,
                ]}
                labelFormatter={(label) => `Time: ${label} IST`}
                contentStyle={{
                  background: '#162C36',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: 12,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0F766E"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0F766E', strokeWidth: 1, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#0F766E', stroke: '#DFF3EF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TrendChart;
