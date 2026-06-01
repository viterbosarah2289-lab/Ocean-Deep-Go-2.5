/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FishSvgProps {
  id: string;
  className?: string;
  animate?: boolean;
  isDead?: boolean;
}

export const FishSvg: React.FC<FishSvgProps> = ({ id, className = 'w-16 h-16', animate = true, isDead = false }) => {
  const swimAnimationClass = animate && !isDead ? 'animate-swim' : '';

  // Return custom crafted SVGs for every species
  const renderSvg = () => {
    switch (id) {
      case 'clownfish':
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(239,120,44,0.4)]">
            {/* Custom Orange Clownfish with signature stripes */}
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              {/* Tails & Fins */}
              <path d="M75 30 L95 12 A11 11 0 0 1 95 48 Z" fill="#ef782c" stroke="#111" strokeWidth="2" />
              <path d="M85 22 L92 18 A5 5 0 0 1 92 42 Z" fill="#fff" />
              <path d="M45 5 L60 0 L55 12 Z" fill="#ef782c" stroke="#111" strokeWidth="1.5" />
              <path d="M42 45 L58 52 L54 38 Z" fill="#ef782c" stroke="#111" strokeWidth="1.5" />
              
              {/* Body */}
              <ellipse cx="45" cy="30" rx="35" ry="20" fill="#f97316" stroke="#111" strokeWidth="2" />
              
              {/* White Stripes with Black Outlines */}
              <path d="M22 13 Q26 30 22 47 L28 46 Q31 30 28 14 Z" fill="#ffffff" stroke="#111" strokeWidth="1" />
              <path d="M44 10 Q48 30 44 50 L51 49 Q55 30 51 11 Z" fill="#ffffff" stroke="#111" strokeWidth="1" />
              <path d="M68 17 Q71 30 68 43 L73 40 Q76 30 73 20 Z" fill="#ffffff" stroke="#111" strokeWidth="1" />
              
              {/* Eye */}
              <circle cx="20" cy="24" r="5" fill="#ffffff" stroke="#111" strokeWidth="1" />
              <circle cx="19" cy="24" r="2.5" fill="#111" />
              <circle cx="18.5" cy="23" r="1" fill="#fff" />

              {/* Gills Detail */}
              <path d="M35 22 Q37 30 35 38" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'bluetang':
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(37,99,235,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              {/* Yellow tail fin */}
              <path d="M72 30 L94 10 Q98 30 94 50 Z" fill="#facc15" stroke="#1e3a8a" strokeWidth="2" />
              <path d="M72 30 L85 22 L85 38 Z" fill="#1e3a8a" />

              {/* Dorsal and Anal Fins */}
              <path d="M30 14 Q50 -2 72 15 Z" fill="#2563eb" stroke="#111" strokeWidth="1.5" />
              <path d="M36 46 Q55 60 70 45 Z" fill="#2563eb" stroke="#111" strokeWidth="1.5" />

              {/* Sapphire Blue Body */}
              <ellipse cx="45" cy="30" rx="32" ry="20" fill="#2563eb" stroke="#111" strokeWidth="2" />

              {/* Characteristic Black Sw swirl design */}
              <path d="M22 25 C45 12 70 18 68 32 C66 43 50 38 42 28 C35 20 28 32 18 30" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" />
              <circle cx="60" cy="32" r="3" fill="#2563eb" />

              {/* Yellow Highlight on Fins */}
              <path d="M52 1 Q64 5 70 12" fill="none" stroke="#facc15" strokeWidth="2" />

              {/* Eye */}
              <circle cx="20" cy="24" r="5" fill="#facc15" />
              <circle cx="19.5" cy="24" r="2.5" fill="#111" />
              <circle cx="18.5" cy="23" r="1" fill="#fff" />
            </g>
          </svg>
        );

      case 'angelfish':
        return (
          <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-[0_4px_8px_rgba(6,182,212,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 35px' }}>
              {/* Very high trailing fins */}
              <path d="M50 20 L25 -8 Q46 -3 48 30 Z" fill="#06b6d4" stroke="#111" strokeWidth="1.5" />
              <path d="M48 50 L18 80 Q40 68 47 40 Z" fill="#06b6d4" stroke="#111" strokeWidth="1.5" />

              {/* Long thin tail fin */}
              <path d="M72 35 L96 20 Q92 35 96 50 Z" fill="#3b82f6" stroke="#111" strokeWidth="1.5" />

              {/* Diamond-shaped body */}
              <path d="M15 35 L48 10 L75 35 L48 60 Z" fill="#ec4899" className="fill-cyan-500" stroke="#111" strokeWidth="2" />

              {/* Vertical stripes of neon blue and yellow */}
              <path d="M35 19 Q41 35 35 51" fill="none" stroke="#facc15" strokeWidth="4" />
              <path d="M48 14 Q54 35 48 56" fill="none" stroke="#1e293b" strokeWidth="5" />
              <path d="M58 20 Q64 35 58 50" fill="none" stroke="#facc15" strokeWidth="4" />

              {/* Long thin feelers at front bottom */}
              <path d="M28 50 Q16 75 14 85" fill="none" stroke="#facc15" strokeWidth="2" />

              {/* Eye */}
              <circle cx="28" cy="28" r="5" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
              <circle cx="28" cy="28" r="2.5" fill="#111" />
            </g>
          </svg>
        );

      case 'butterflyfish':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-[0_4px_8px_rgba(234,179,8,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 32px' }}>
              {/* Spiky Dorsal profile */}
              <path d="M26 15 Q50 -4 72 18 Z" fill="#eab308" stroke="#111" strokeWidth="1.5" />
              <path d="M36 48 Q55 60 70 45 Z" fill="#eab308" stroke="#111" strokeWidth="1.5" />

              {/* Small Tail */}
              <path d="M72 32 L92 20 L92 44 Z" fill="#1e293b" stroke="#111" strokeWidth="1.5" />
              <path d="M82 25 L90 22 L90 42 Z" fill="#ffffff" />

              {/* Disc-shaped Lemon Body */}
              <circle cx="45" cy="32" r="24" fill="#facc15" stroke="#111" strokeWidth="2" />

              {/* Black Eye Mask Stripe */}
              <path d="M24 10 L34 8 L22 54 L14 52 Z" fill="#111" />

              {/* Back spot eyespot */}
              <circle cx="62" cy="25" r="5" fill="#111" stroke="#fff" strokeWidth="1.5" strokeDasharray="none" />

              {/* Delicate lines */}
              <path d="M38 20 L58 35" fill="none" stroke="#eab308" strokeWidth="1.5" />
              <path d="M35 28 L55 43" fill="none" stroke="#eab308" strokeWidth="1.5" />

              {/* Eye (situated inside black mask) */}
              <circle cx="21" cy="22" r="4.5" fill="#facc15" />
              <circle cx="21" cy="22" r="2.5" fill="#111" />
              <circle cx="20.5" cy="21" r="0.8" fill="#fff" />
            </g>
          </svg>
        );

      case 'lionfish':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-[0_4px_8px_rgba(220,38,38,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '25px 32px' }}>
              {/* Fan of pectoral spiky spikes background */}
              <path d="M12 -2 L28 15 M4 -4 L25 10 M20 -5 L26 14 M-2 15 L22 25" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M8 45 L25 35 M12 55 L28 38 M4 68 L24 40 M-3 50 L20 32" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />

              {/* Spiky outline fins */}
              <path d="M30 18 Q50 -8 72 20 Z" fill="#dc2626" stroke="#111" strokeWidth="1.5" />
              <path d="M72 15 L95 2 L95 62 L72 45 Z" fill="#dc2626" stroke="#111" strokeWidth="1.5" />

              {/* Zebra striped body */}
              <ellipse cx="45" cy="32" rx="30" ry="18" fill="#b91c1c" stroke="#111" strokeWidth="2" />
              {[30, 36, 42, 48, 54, 60, 66].map((x, i) => (
                <path
                  key={i}
                  d={`M${x} ${32 - Math.sqrt(1 - Math.pow((x-45)/30,2))*18} Q${x+4} 32 ${x} ${32 + Math.sqrt(1 - Math.pow((x-45)/30,2))*18}`}
                  fill="none"
                  stroke="#fee2e2"
                  strokeWidth="2.5"
                />
              ))}

              {/* Eye */}
              <circle cx="23" cy="25" r="5" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
              <circle cx="23" cy="25" r="2.5" fill="#111" />
              {/* Spikes above eye */}
              <path d="M21 21 L16 11 M25 21 L22 9" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'parrotfish':
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(45,212,191,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              {/* Wave fin tail */}
              <path d="M72 30 L94 12 C98 25 98 35 94 48 Z" fill="#14b8a6" stroke="#111" strokeWidth="1.5" />
              <path d="M80 20 Q90 30 80 40 Z" fill="#ec4899" />

              {/* Top/bottom neon fins */}
              <path d="M32 15 Q55 2 70 18 Z" fill="#ec4899" stroke="#111" strokeWidth="1" />
              <path d="M38 45 Q58 58 68 42 Z" fill="#14b8a6" stroke="#111" strokeWidth="1" />

              {/* Cyan, pink body */}
              <ellipse cx="45" cy="30" rx="32" ry="19" fill="#0d9488" stroke="#111" strokeWidth="2" />

              {/* Pink Highlight belly/gills */}
              <path d="M16 32 Q26 44 48 42 Q32 28 16 32" fill="#ec4899" opacity="0.85" />

              {/* Parrot Beak */}
              <path d="M13 25 Q6 28 12 34 Q15 32 13 25" fill="#facc15" stroke="#111" strokeWidth="1.5" />
              <path d="M12 29 L7 31" stroke="#111" strokeWidth="1.5" />

              {/* Eye */}
              <circle cx="22" cy="21" r="5" fill="#facc15" stroke="#111" strokeWidth="1" />
              <circle cx="22" cy="21" r="2.5" fill="#111" />
            </g>
          </svg>
        );

      case 'moorishidol':
        return (
          <svg viewBox="0 0 100 75" className="w-full h-full drop-shadow-[0_4px_8px_rgba(15,23,42,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 38px' }}>
              {/* Tall streamer dorsal fin */}
              <path d="M42 22 L20 -15 Q36 -8 38 22 Z" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
              {/* Yellow long tail */}
              <path d="M72 38 L95 24 Q91 38 95 52 Z" fill="#1e293b" stroke="#111" strokeWidth="1.5" />
              <path d="M32 54 L15 85 Q30 76 35 50 Z" fill="#334155" />

              {/* Flat High disc-like body shape */}
              <path d="M18 38 Q32 10 52 16 Q72 30 72 38 Q72 46 62 60 Q32 66 18 38 Z" fill="#facc15" stroke="#111" strokeWidth="2" />

              {/* Dramatic bold black crescent stripes */}
              <path d="M28 20 C38 20 28 58 24 58 C16 58 24 20 28 20" fill="#111" />
              <path d="M48 16 C58 16 52 64 42 62 C38 60 44 16 48 16" fill="#111" />

              {/* White patches */}
              <path d="M30 20 Q35 38 30 56 L36 54 Q40 38 36 20 Z" fill="#ffffff" />

              {/* Eye */}
              <circle cx="22" cy="28" r="4.5" fill="#ffffff" stroke="#111" strokeWidth="1" />
              <circle cx="22" cy="28" r="2.5" fill="#111" />
              
              {/* Coral orange snout tip */}
              <path d="M18 36 L11 38 L18 42 Z" fill="#f97316" stroke="#111" strokeWidth="1" />
            </g>
          </svg>
        );

      case 'pufferfish':
        return (
          <svg viewBox="0 0 100 65" className="w-full h-full drop-shadow-[0_4px_8px_rgba(180,83,9,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '25px 32px' }}>
              {/* Balloon circle body */}
              <circle cx="45" cy="32" r="24" fill="#d97706" stroke="#111" strokeWidth="2" />
              
              {/* Soft Belly area */}
              <path d="M23 38 A22 22 0 0 0 67 38 Z" fill="#fef3c7" stroke="#111" strokeWidth="1.5" />

              {/* Swarm of tiny triangular protective spines */}
              <path d="M26 36 L24 40 L28 40 Z" fill="#111" />
              <path d="M34 42 L32 46 L36 46 Z" fill="#111" />
              <path d="M45 45 L43 49 L47 49 Z" fill="#111" />
              <path d="M56 42 L54 46 L58 46 Z" fill="#111" />
              <path d="M64 36 L62 40 L66 40 Z" fill="#111" />
              <path d="M45 15 L43 11 L47 11 Z" fill="#111" />
              <path d="M32 20 L29 17 L33 17 Z" fill="#111" />
              <path d="M58 20 L61 17 L57 17 Z" fill="#111" />

              {/* Small fan fins */}
              <path d="M69 32 L84 22 L84 42 Z" fill="#f1f5f9" opacity="0.8" stroke="#111" strokeWidth="1" />
              <path d="M42 8 L54 8 L48 14 Z" fill="#d97706" />

              {/* Puffy heavy eyes */}
              <circle cx="26" cy="25" r="6" fill="#fef3c7" stroke="#111" strokeWidth="1.5" />
              <circle cx="26" cy="25" r="3" fill="#111" />
              <circle cx="25" cy="24" r="1" fill="#fff" />

              {/* Rounded small cute lips */}
              <path d="M19 32 Q15 30 18 28 Q21 30 19 32" fill="#ef4444" stroke="#111" strokeWidth="1.5" />
            </g>
          </svg>
        );

      case 'royalgramma':
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(147,51,234,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              {/* Back Yellow Fin, Front purple */}
              <path d="M72 30 L94 10 L94 50 Z" fill="#facc15" stroke="#111" strokeWidth="1.5" />
              <path d="M32 14 Q54 2 72 16 L72 30 Z" fill="#a855f7" stroke="#111" strokeWidth="1" />
              <path d="M38 46 Q58 58 72 44 L72 30 Z" fill="#facc15" stroke="#111" strokeWidth="1" />

              {/* Cylindrical elegant body */}
              <ellipse cx="45" cy="30" rx="32" ry="18" fill="#a855f7" stroke="#111" strokeWidth="2" />

              {/* Color Dip split line at x=52 */}
              <path d="M50 12 C58 12 50 48 58 48 L77 38 C77 22 58 12 50 12 Z" fill="#facc15" />

              {/* Shading stripes */}
              <path d="M18 26 L28 26" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M20 33 L32 33" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" />

              {/* Eye */}
              <circle cx="20" cy="22" r="5" fill="#facc15" stroke="#111" strokeWidth="1.2" />
              <circle cx="20" cy="22" r="2.5" fill="#111" />
            </g>
          </svg>
        );

      case 'triggerfish':
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(56,189,248,0.4)]">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              {/* Trigger locking pin on dorsals */}
              <path d="M34 16 L38 4 L44 18 H34" fill="#0284c7" stroke="#111" strokeWidth="1.5" />
              
              {/* Back soft fins */}
              <path d="M52 15 Q68 5 72 20 Z" fill="#38bdf8" />
              <path d="M52 45 Q68 55 72 40 Z" fill="#38bdf8" />

              {/* Diamond-oval compressed body */}
              <path d="M15 30 L45 12 L73 30 L45 48 Z" fill="#0284c7" stroke="#111" strokeWidth="2" />

              {/* Golden/blue geometric lines on snout */}
              <path d="M16 30 Q28 20 40 22" fill="none" stroke="#facc15" strokeWidth="3" />
              <path d="M15 32 Q28 36 38 32" fill="none" stroke="#38bdf8" strokeWidth="3.5" />

              {/* Deep yellow markings near gill */}
              <path d="M42 22 L48 38" stroke="#facc15" strokeWidth="4.5" strokeLinecap="round" />

              {/* Tail fin with filaments */}
              <path d="M73 30 L94 15 Q88 30 94 45 Z" fill="#f97316" stroke="#111" strokeWidth="1.5" />

              {/* High geometric eye */}
              <circle cx="36" cy="22" r="4" fill="#ffffff" stroke="#111" strokeWidth="1" />
              <circle cx="36" cy="22" r="2" fill="#111" />
            </g>
          </svg>
        );

      default:
        // Basic fallback fish shape inside beautiful bubbles
        return (
          <svg viewBox="0 0 100 60" className="w-full h-full">
            <g className={swimAnimationClass} style={{ transformOrigin: '20px 30px' }}>
              <path d="M15 30 C30 10 70 10 80 30 C70 50 30 50 15 30 Z" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="2" />
              <path d="M80 30 L95 15 L95 45 Z" fill="#1e3a8a" />
              <circle cx="30" cy="25" r="4" fill="#fff" />
              <circle cx="30" cy="25" r="2" fill="#111" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className={`${className} flex items-center justify-center transition-all duration-300 ${isDead ? 'scale-75 opacity-25 grayscale saturate-50' : 'hover:scale-110 active:scale-95'}`} id={`fish-svg-${id}`}>
      {renderSvg()}
    </div>
  );
};
