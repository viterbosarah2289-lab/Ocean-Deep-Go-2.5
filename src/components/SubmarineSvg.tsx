/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SubmarineSvgProps {
  className?: string;
  hasShield?: boolean;
  hullColor?: string;
}

export const SubmarineSvg: React.FC<SubmarineSvgProps> = ({ 
  className = 'w-14 h-14', 
  hasShield = false,
  hullColor
}) => {
  const activeColor = hullColor || (typeof window !== 'undefined' && localStorage.getItem('ocean_deep_go_sub_color')) || '#eab308';
  // Darker shade calculation for accents
  const darkAccent = activeColor === '#eab308' ? '#ca8a04' : `${activeColor}dd`;

  return (
    <div className={`${className} relative flex items-center justify-center`} id="submarine-svg-holder">
      
      {/* Optional invulnerable shield energy ring */}
      {hasShield && (
        <div className="absolute inset-0 rounded-full border-4 border-cyan-400/80 animate-ping opacity-75" />
      )}
      
      <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-[0_4px_10px_rgba(234,179,8,0.3)]">
        <g style={{ transformOrigin: '50px 32px' }}>
          
          {/* Propeller (animated spin) */}
          <g className="animate-pulse" style={{ transformOrigin: '82px 32px' }}>
            <rect x="80" y="24" width="3" height="16" fill="#475569" stroke="#111" strokeWidth="1" rx="1" />
            <path d="M82 20 L84 44" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          </g>
 
          {/* Propeller stem connection */}
          <rect x="74" y="30" width="7" height="4" fill="#64748b" stroke="#111" strokeWidth="1" />
 
          {/* Rudder Fins top/bottom */}
          <path d="M60 14 L75 10 L70 32 Z" fill="#b45309" stroke="#111" strokeWidth="1.2" />
          <path d="M60 50 L75 54 L70 32 Z" fill="#b45309" stroke="#111" strokeWidth="1.2" />
 
          {/* Main Submarine Hull cylinder */}
          <rect x="18" y="18" width="56" height="28" fill={activeColor} stroke="#111" strokeWidth="2.2" rx="14" />
 
          {/* High-visibility Stripes */}
          <path d="M34 18 Q38 32 34 46" fill="none" stroke="#111" strokeWidth="2.5" />
          <path d="M50 18 Q54 32 50 46" fill="none" stroke="#111" strokeWidth="2.5" />
 
          {/* Viewing Glass Portholes */}
          <circle cx="28" cy="32" r="5" fill="#38bdf8" stroke="#111" strokeWidth="1.5" />
          <circle cx="27" cy="31" r="1.5" fill="#fff" />
          
          <circle cx="44" cy="32" r="5" fill="#38bdf8" stroke="#111" strokeWidth="1.5" />
          <circle cx="43" cy="31" r="1.5" fill="#fff" />
 
          <circle cx="60" cy="32" r="5" fill="#38bdf8" stroke="#111" strokeWidth="1.5" />
          <circle cx="59" cy="31" r="1.5" fill="#fff" />
 
          {/* Periscope Tower */}
          <path d="M42 18 L42 4 L48 4 L48 8 L44 8 L44 18 Z" fill={darkAccent} stroke="#111" strokeWidth="1.5" />
          <circle cx="48" cy="6" r="1.5" fill="#ef4444" /> {/* Lens active radar glowing red */}
 
          {/* Front Light beam glowing path */}
          <polygon points="18,32 0,15 0,49" fill="url(#lightBeamGrad)" opacity="0.3" pointerEvents="none" />
 
          {/* Left Nose Cap */}
          <path d="M18 18 C12 18 10 32 18 46" fill={darkAccent} stroke="#111" strokeWidth="1" />

          <defs>
            <linearGradient id="lightBeamGrad" x1="100%" y1="50%" x2="0%" y2="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      </svg>
    </div>
  );
};
