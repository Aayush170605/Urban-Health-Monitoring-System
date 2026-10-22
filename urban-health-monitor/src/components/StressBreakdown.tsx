// ──────────────────────────────────────────────
// Urban Health Monitoring System – Stress Breakdown
// ──────────────────────────────────────────────

import React from 'react';
import { ComponentScores, WeightedContributions } from '../types';

interface StressBreakdownProps {
  componentScores: ComponentScores;
  weightedContributions: WeightedContributions;
  urbanStressIndex: number;
}

export const StressBreakdown: React.FC<StressBreakdownProps> = ({
  componentScores,
  weightedContributions,
  urbanStressIndex,
}) => {
  return (
    <div className="stress-breakdown">
      {/* Air Component */}
      <div className="component-row">
        <div className="component-header">
          <span className="component-name">Air Quality (Weight: 45%)</span>
          <span className="component-values">
            Score: {componentScores.airScore.toFixed(1)}/100 &rarr; Contrib: +{weightedContributions.air.toFixed(1)}
          </span>
        </div>
        <div className="component-bar-track">
          <div
            className="component-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, componentScores.airScore))}%`, background: '#0F766E' }}
          />
        </div>
      </div>

      {/* Noise Component */}
      <div className="component-row">
        <div className="component-header">
          <span className="component-name">Acoustic Noise (Weight: 35%)</span>
          <span className="component-values">
            Score: {componentScores.noiseScore.toFixed(1)}/100 &rarr; Contrib: +{weightedContributions.noise.toFixed(1)}
          </span>
        </div>
        <div className="component-bar-track">
          <div
            className="component-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, componentScores.noiseScore))}%`, background: '#0F766E' }}
          />
        </div>
      </div>

      {/* Traffic Component */}
      <div className="component-row">
        <div className="component-header">
          <span className="component-name">Traffic Stress (Weight: 20%)</span>
          <span className="component-values">
            Score: {componentScores.trafficScore.toFixed(1)}/100 &rarr; Contrib: +{weightedContributions.traffic.toFixed(1)}
          </span>
        </div>
        <div className="component-bar-track">
          <div
            className="component-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, componentScores.trafficScore))}%`, background: '#0F766E' }}
          />
        </div>
        <div className="sub-component">
          &bull; Waiting time score (60% of traffic): {componentScores.waitScore.toFixed(1)}/100
        </div>
        <div className="sub-component">
          &bull; Queue length score (40% of traffic): {componentScores.queueScore.toFixed(1)}/100
        </div>
      </div>

      {/* Total */}
      <div className="stress-total">
        Weighted Sum: {urbanStressIndex} / 100
      </div>

      {/* Formula Documentation */}
      <div style={{ fontSize: 11, color: '#536872', lineHeight: 1.4, margin: '4px 0' }}>
        <strong>Demo Formula:</strong><br />
        airScore = 100 &times; clamp01(AQI / 300)<br />
        noiseScore = 100 &times; clamp01((LAeq &minus; 45) / 45)<br />
        trafficScore = 0.60 &times; waitScore + 0.40 &times; queueScore<br />
        USI = round(0.45 &times; air + 0.35 &times; noise + 0.20 &times; traffic)
      </div>

      {/* Disclaimer */}
      <div className="stress-disclaimer">
        Demo formula combining air, noise and traffic conditions. Not a validated health or psychological assessment.
      </div>
    </div>
  );
};

export default StressBreakdown;
