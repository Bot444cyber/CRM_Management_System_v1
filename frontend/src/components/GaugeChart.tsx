import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  percentage: number;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ percentage, size = 60 }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

  // Segmented look: use a high dasharray with small gaps
  const segments = 20;
  const segmentLength = (circumference / 2) / segments;
  const dashArray = `${segmentLength * 0.7} ${segmentLength * 0.3}`;

  // Smooth color interpolation
  // Red: 244, 63, 94 (rose-500)
  // Yellow: 245, 158, 11 (amber-500)
  // Green: 16, 185, 129 (emerald-500)
  const getInterpolatedColor = (p: number) => {
    let r, g, b;
    if (p < 50) {
      // Interpolate between Red and Yellow
      const factor = p / 50;
      r = Math.round(244 + (245 - 244) * factor);
      g = Math.round(63 + (158 - 63) * factor);
      b = Math.round(94 + (11 - 94) * factor);
    } else {
      // Interpolate between Yellow and Green
      const factor = (p - 50) / 50;
      r = Math.round(245 + (16 - 245) * factor);
      g = Math.round(158 + (185 - 158) * factor);
      b = Math.round(11 + (129 - 11) * factor);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const strokeColor = getInterpolatedColor(percentage);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 }}>
      <svg className="transform -rotate-180" width={size} height={size / 2} viewBox="0 0 60 30">
        {/* Background track */}
        <path
          d="M 6 30 A 24 24 0 0 1 54 30"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={dashArray}
        />
        {/* Progress track */}
        <path
          d="M 6 30 A 24 24 0 0 1 54 30"
          fill="none"
          style={{ stroke: strokeColor }}
          className="transition-all duration-500 ease-out"
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={dashArray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};

export default GaugeChart;
