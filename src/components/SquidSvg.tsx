/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SquidSvgProps {
  className?: string;
  isAttacking?: boolean;
}

export const SquidSvg: React.FC<SquidSvgProps> = ({ className = 'w-24 h-24', isAttacking = false }) => {
  const tentacleAnimClass = isAttacking ? 'animate-pulse' : '';

  return (
    <div className={`${className} flex items-center justify-center`} id="squid-svg-visual">
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(239,68,68,0.35)]">
        <g style={{ transformOrigin: '60px 60px' }}>
          
          {/* Back tentacles waving */}
          <g className={tentacleAnimClass}>
            {/* Left Back Tentacle */}
            <path d="M40 70 Q10 95 15 115 Q30 115 45 80" fill="#a21caf" stroke="#111" strokeWidth="1.5" />
            <circle cx="20" cy="100" r="1.5" fill="#fbcfe8" />
            <circle cx="25" cy="105" r="1.5" fill="#fbcfe8" />

            {/* Right Back Tentacle */}
            <path d="M80 70 Q110 95 105 115 Q90 115 75 80" fill="#a21caf" stroke="#111" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="1.5" fill="#fbcfe8" />
            <circle cx="95" cy="105" r="1.5" fill="#fbcfe8" />
          </g>

          {/* Main front tentacles with suction cups */}
          <g className={tentacleAnimClass}>
            {/* Center Left Tentacle */}
            <path d="M50 75 Q28 105 34 125 Q42 125 54 82" fill="#c026d3" stroke="#111" strokeWidth="1.5" />
            <circle cx="36" cy="104" r="2" fill="#fff" />
            <circle cx="38" cy="112" r="2" fill="#fff" />
            <circle cx="42" cy="118" r="2" fill="#fff" />

            {/* Center Right Tentacle */}
            <path d="M70 75 Q92 105 86 125 Q78 125 66 82" fill="#c026d3" stroke="#111" strokeWidth="1.5" />
            <circle cx="84" cy="104" r="2" fill="#fff" />
            <circle cx="82" cy="112" r="2" fill="#fff" />
            <circle cx="78" cy="118" r="2" fill="#fff" />

            {/* Middle inner grasping tentacle */}
            <path d="M60 78 Q50 110 60 128 Q70 110 60 78" fill="#d946ef" stroke="#111" strokeWidth="1.5" />
            <circle cx="56" cy="105" r="1.5" fill="#fff" />
            <circle cx="64" cy="105" r="1.5" fill="#fff" />
            <circle cx="57" cy="115" r="1.5" fill="#fff" />
            <circle cx="63" cy="115" r="1.5" fill="#fff" />
          </g>

          {/* Huge Squid Mantle (Head) */}
          <path d="M36 60 Q34 15 60 5 Q86 15 84 60 Z" fill="#86198f" stroke="#111" strokeWidth="2" />
          
          {/* Horizontal Head Fins (Ears) */}
          <path d="M38 25 L10 15 L37 10 Z" fill="#701a75" stroke="#111" strokeWidth="1.5" />
          <path d="M82 25 L110 15 L83 10 Z" fill="#701a75" stroke="#111" strokeWidth="1.5" />

          {/* Glowing yellow giant eyes */}
          <ellipse cx="46" cy="54" rx="7" ry="5.5" fill="#facc15" stroke="#111" strokeWidth="1.5" />
          <circle cx="48" cy="54" r="3" fill="#111" />
          <circle cx="49.5" cy="52.5" r="1" fill="#fff" />

          <ellipse cx="74" cy="54" rx="7" ry="5.5" fill="#facc15" stroke="#111" strokeWidth="1.5" />
          <circle cx="72" cy="54" r="3" fill="#111" />
          <circle cx="70.5" cy="52.5" r="1" fill="#fff" />

          {/* Deep forehead lines */}
          <path d="M53 25 Q60 30 67 25" fill="none" stroke="#701a75" strokeWidth="2" />
          <path d="M50 34 Q60 38 70 34" fill="none" stroke="#701a75" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
