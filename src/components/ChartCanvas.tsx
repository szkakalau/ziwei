"use client";

import { useRef, useState, useCallback } from "react";

interface Palace {
  name?: string;
  majorStars?: Array<{ name?: string }>;
  minorStars?: Array<{ name?: string }>;
}

interface ChartCanvasProps {
  palaces?: Palace[];
  soulPalaceLabel?: string;
}

const PALACE_ORDER = [
  "Soul", "Parents", "Mind", "Property",
  "Career", "Friends", "Health", "Spouse",
  "Children", "Wealth", "Siblings", "Travel",
];

const PALACE_ANGLE = 360 / 12; // 30 degrees per palace

export function ChartCanvas({ palaces = [], soulPalaceLabel }: ChartCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedPalace, setSelectedPalace] = useState<string | null>(null);
  const [expandedStars, setExpandedStars] = useState<string[]>([]);

  const handlePalaceClick = useCallback((palaceName: string, stars: string[]) => {
    if (selectedPalace === palaceName) {
      setSelectedPalace(null);
      setExpandedStars([]);
    } else {
      setSelectedPalace(palaceName);
      setExpandedStars(stars);
    }
  }, [selectedPalace]);

  const radius = 160;
  const centerX = 200;
  const centerY = 220;
  const innerRadius = 60;

  if (!palaces || palaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30 text-sm">
        No chart data available
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 400 460"
        className="w-full max-w-md mx-auto"
        aria-label="Zi Wei Dou Shu birth chart"
      >
        {/* Palace sectors */}
        {PALACE_ORDER.map((name, i) => {
          const palace = palaces.find(
            (p) => (p.name ?? "").toLowerCase() === name.toLowerCase(),
          );
          const angle = i * PALACE_ANGLE - 90; // Start from top
          const rad = (angle * Math.PI) / 180;
          const midAngle = angle + PALACE_ANGLE / 2;
          const midRad = (midAngle * Math.PI) / 180;
          const labelR = radius - 35;

          const x1 = centerX + innerRadius * Math.cos(rad);
          const y1 = centerY + innerRadius * Math.sin(rad);
          const x2 = centerX + radius * Math.cos(rad);
          const y2 = centerY + radius * Math.sin(rad);
          const nextRad = ((angle + PALACE_ANGLE) * Math.PI) / 180;
          const nx2 = centerX + radius * Math.cos(nextRad);
          const ny2 = centerY + radius * Math.sin(nextRad);
          const nx1 = centerX + innerRadius * Math.cos(nextRad);
          const ny1 = centerY + innerRadius * Math.sin(nextRad);

          const isSelected = selectedPalace === name;
          const isSoul = soulPalaceLabel && name === "Soul";

          const majorStars = (palace?.majorStars ?? [])
            .map((s) => s?.name)
            .filter(Boolean) as string[];
          const minorStars = (palace?.minorStars ?? [])
            .map((s) => s?.name)
            .filter(Boolean) as string[];
          const allStars = [...majorStars, ...minorStars];

          return (
            <g key={name}>
              {/* Palace wedge */}
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${nx2} ${ny2} L ${nx1} ${ny1} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`}
                fill={isSelected ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.015)"}
                stroke={isSoul ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}
                strokeWidth={isSoul ? 1.5 : 0.5}
                className="cursor-pointer transition-colors hover:fill-white/[0.04]"
                onClick={() => handlePalaceClick(name, allStars)}
              />
              {/* Palace name */}
              <text
                x={centerX + labelR * Math.cos(midRad)}
                y={centerY + labelR * Math.sin(midRad)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSoul ? "#fbbf24" : "rgba(255,255,255,0.45)"}
                fontSize="10"
                fontWeight={isSoul ? 600 : 400}
                fontFamily="system-ui, sans-serif"
                className="pointer-events-none select-none"
              >
                {name}
              </text>
              {/* Star dots */}
              {allStars.slice(0, 2).map((star, si) => {
                const dotR = radius - 50 - si * 14;
                return (
                  <circle
                    key={star}
                    cx={centerX + dotR * Math.cos(midRad)}
                    cy={centerY + dotR * Math.sin(midRad)}
                    r={2}
                    fill={majorStars.includes(star) ? "#fbbf24" : "rgba(255,255,255,0.35)"}
                    className="pointer-events-none"
                  />
                );
              })}
              {allStars.length > 2 && (
                <text
                  x={centerX + (radius - 52 - 28) * Math.cos(midRad)}
                  y={centerY + (radius - 52 - 28) * Math.sin(midRad)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.2)"
                  fontSize="7"
                  className="pointer-events-none select-none"
                >
                  +{allStars.length - 2}
                </text>
              )}
            </g>
          );
        })}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 5}
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(251,191,36,0.12)"
          strokeWidth={0.5}
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(251,191,36,0.6)"
          fontSize="13"
          fontWeight={600}
          fontFamily="system-ui, sans-serif"
          className="pointer-events-none select-none"
        >
          Zi Wei
        </text>
      </svg>

      {/* Expanded star detail panel (in-place, below chart) */}
      {selectedPalace && expandedStars.length > 0 && (
        <div className="mt-4 mx-4 p-4 rounded-xl bg-white/[0.03] border border-amber-500/10">
          <h3 className="text-amber-200/80 text-sm font-medium mb-2">
            {selectedPalace} Palace
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {expandedStars.map((star) => (
              <span
                key={star}
                className="px-2.5 py-1 rounded-full text-xs
                           bg-amber-500/10 text-amber-300/80
                           border border-amber-500/15"
              >
                {star}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
