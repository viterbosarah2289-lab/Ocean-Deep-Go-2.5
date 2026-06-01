/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TurtleSvgProps {
  id: string;
  className?: string;
  animate?: boolean;
}

export const TurtleSvg: React.FC<TurtleSvgProps> = ({ id, className = 'w-12 h-12', animate = true }) => {
  const bobbingClass = animate ? 'animate-swim' : '';

  const getColors = () => {
    switch (id) {
      case 'shelly':
        return {
          shell: '#10b981', // emerald
          border: '#047857',
          skin: '#34d399',
          pattern: '#a7f3d0'
        };
      case 'turbo':
        return {
          shell: '#06b6d4', // cyan
          border: '#0e7490',
          skin: '#22d3ee',
          pattern: '#99f6e4'
        };
      case 'coral':
        return {
          shell: '#f43f5e', // rose-pink
          border: '#be123c',
          skin: '#fb7185',
          pattern: '#fecdd3'
        };
      case 'wave':
        return {
          shell: '#3b82f6', // blue
          border: '#1d4ed8',
          skin: '#60a5fa',
          pattern: '#bfdbfe'
        };
      default:
        return {
          shell: '#8b5cf6', // purple fallback
          border: '#6d28d9',
          skin: '#a78bfa',
          pattern: '#ddd6fe'
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`${className} flex items-center justify-center`} id={`turtle-svg-container-${id}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">
        <g className={bobbingClass} style={{ transformOrigin: '50px 50px' }}>
          {/* Flippers / Legs - Front Right */}
          <path d="M72 24 C82 12 94 14 90 28 C86 42 70 34 72 24 Z" fill={colors.skin} stroke="#111" strokeWidth="1.5" />
          
          {/* Flippers / Legs - Front Left */}
          <path d="M28 24 C18 12 6 14 10 28 C14 42 30 34 28 24 Z" fill={colors.skin} stroke="#111" strokeWidth="1.5" />

          {/* Flippers / Legs - Back Right */}
          <path d="M74 72 C80 84 75 92 68 88 C61 84 66 74 74 72 Z" fill={colors.skin} stroke="#111" strokeWidth="1.5" />

          {/* Flippers / Legs - Back Left */}
          <path d="M26 72 C20 84 25 92 32 88 C39 84 34 74 26 72 Z" fill={colors.skin} stroke="#111" strokeWidth="1.5" />

          {/* Tail */}
          <path d="M50 78 L47 92 L53 92 Z" fill={colors.skin} stroke="#111" strokeWidth="1.5" />

          {/* Turtle Small Oval Head */}
          <ellipse cx="50" cy="18" rx="10" ry="14" fill={colors.skin} stroke="#111" strokeWidth="1.5" />
          
          {/* Eyes with white reflection */}
          <circle cx="46" cy="12" r="2.5" fill="#111" />
          <circle cx="45.5" cy="11.5" r="0.8" fill="#fff" />
          <circle cx="54" cy="12" r="2.5" fill="#111" />
          <circle cx="53.5" cy="11.5" r="0.8" fill="#fff" />

          {/* Core Shell (Outer rim) */}
          <circle cx="50" cy="50" r="32" fill={colors.border} stroke="#111" strokeWidth="2" />

          {/* Main Inner Shell */}
          <circle cx="50" cy="51" r="27" fill={colors.shell} />

          {/* Geometric Shell Pattern specs */}
          <polygon points="50,30 63,38 63,55 50,63 37,55 37,38" fill="none" stroke={colors.pattern} strokeWidth="1.5" />
          
          {/* Spoke lines outwards to define plates */}
          <line x1="50" y1="30" x2="50" y2="19" stroke={colors.pattern} strokeWidth="1.5" />
          <line x1="63" y1="38" x2="72" y2="33" stroke={colors.pattern} strokeWidth="1.5" />
          <line x1="63" y1="55" x2="74" y2="60" stroke={colors.pattern} strokeWidth="1.5" />
          <line x1="50" y1="63" x2="50" y2="78" stroke={colors.pattern} strokeWidth="1.5" />
          <line x1="37" y1="55" x2="26" y2="60" stroke={colors.pattern} strokeWidth="1.5" />
          <line x1="37" y1="38" x2="28" y2="33" stroke={colors.pattern} strokeWidth="1.5" />

          {/* Center Turtle shield emblem */}
          <polygon points="50,40 57,45 57,55 50,60 43,55 43,45" fill={colors.pattern} opacity="0.35" />
        </g>
      </svg>
    </div>
  );
};
