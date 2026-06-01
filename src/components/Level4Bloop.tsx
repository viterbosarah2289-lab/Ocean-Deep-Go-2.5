/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SubmarineSvg } from './SubmarineSvg';
import { audio } from '../utils/audio';
import { 
  Skull, AlertOctagon, Timer, Heart, Trophy, Zap, 
  RotateCcw, Play, ShieldAlert, Activity, Shield, 
  Volume2, VolumeX, Eye, Flame, ShieldAlert as ShelterIcon, ArrowUpLeft, ChevronRight, Crosshair
} from 'lucide-react';

interface Level4BloopProps {
  onComplete: (score: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

interface Debris {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface PowerUp {
  id: string;
  type: 'shield' | 'speed' | 'heart' | 'health_pack' | 'radar';
  x: number;
  y: number;
}

interface Shockwave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
}

interface RadiationZone {
  id: string;
  x: number;
  y: number;
  radius: number;
}

interface Shelter {
  id: string;
  x: number;
  y: number;
  radius: number;
  name: string;
}

export const Level4Bloop: React.FC<Level4BloopProps> = ({ onComplete, onPrev, onNext }) => {
  const [gameState, setGameState] = useState<'intro' | 'active' | 'round_success' | 'game_over' | 'victory'>('intro');
  const [round, setRound] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(650);

  // Player Stats
  const [health, setHealth] = useState<number>(100);
  const [lives, setLives] = useState<number>(3);
  const [subX, setSubX] = useState<number>(400);
  const [subY, setSubY] = useState<number>(225);

  // Power status timers
  const [shieldTimer, setShieldTimer] = useState<number>(0);
  const [speedTimer, setSpeedTimer] = useState<number>(0);
  const [radarTimer, setRadarTimer] = useState<number>(0);

  // Active Threats & Entities
  const [debris, setDebris] = useState<Debris[]>([]);
  const [powerups, setPowerUps] = useState<PowerUp[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
  const [radiationZones, setRadiationZones] = useState<RadiationZone[]>([]);
  
  // Giant Abyssal Megamouth Monster Fish (Dheer Level 4 request)
  const [monsterX, setMonsterX] = useState<number>(50);
  const [monsterY, setMonsterY] = useState<number>(380);
  
  // Bloop Bomb Alert phases
  const [bloopTimer, setBloopTimer] = useState<number | null>(null); // Countdown to surface bomb (e.g. 5,4,3,2,1)
  const [bloopActive, setBloopActive] = useState<boolean>(false);
  const [nuclearFlash, setNuclearFlash] = useState<boolean>(false);

  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());

  // Input Keys Ref
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const lastBloopTriggerTime = useRef<number>(60); // Tracks timer left when bloop triggered

  // Fixed Board Structures
  const shelters: Shelter[] = [
    { id: 'cave_left', x: 120, y: 120, radius: 55, name: 'Sunken shipwreck hull' },
    { id: 'cave_right', x: 680, y: 330, radius: 55, name: 'Obsidian deep sea cave' }
  ];

  // Toggle sound
  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  const startLevel4 = () => {
    audio.playPowerUp();
    setRound(1);
    initRound(1, 3, 100);
    setScore(650);
  };

    // Initialize a round
  const initRound = (rNum: number, startLives: number, startHealth: number) => {
    setRound(rNum);
    setLives(startLives);
    setHealth(startHealth);
    setSubX(400);
    setSubY(225);
    setMonsterX(100);
    setMonsterY(380);
    setTimeLeft(60);
    setBloopTimer(null);
    setBloopActive(false);
    setNuclearFlash(false);
    setShieldTimer(0);
    setSpeedTimer(0);
    setRadarTimer(0);

    // Initial Threat allocations
    setDebris(generateInitialDebris(rNum));
    setPowerUps([]);
    setShockwaves([]);
    
    // Static radiation zones depending on round
    const rads: RadiationZone[] = [];
    if (rNum >= 2) {
      rads.push({ id: 'rad1', x: 300, y: 150, radius: 60 });
    }
    if (rNum >= 3) {
      rads.push({ id: 'rad2', x: 500, y: 300, radius: 60 });
    }
    if (rNum >= 4) {
      rads.push({ id: 'rad3', x: 400, y: 80, radius: 70 });
    }
    setRadiationZones(rads);

    lastBloopTriggerTime.current = 60;
    setGameState('active');
  };

  const generateInitialDebris = (rNum: number): Debris[] => {
    const count = 3 + rNum * 2;
    const list: Debris[] = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: `deb-${i}-${Math.random()}`,
        x: Math.random() * 760 + 20,
        y: Math.random() * -300 - 50, // Start above screen
        size: Math.random() * 20 + 15,
        speed: Math.random() * 1.5 + 1.2 + rNum * 0.4
      });
    }
    return list;
  };

  // Click / Mouse click navigation support inside arena
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'active' || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Glide smoothly towards click coordinates
    setSubX(Math.max(25, Math.min(clickX, 775)));
    setSubY(Math.max(25, Math.min(clickY, 425)));
    audio.playClick();
  };

  // Register Keyboard Input bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
        e.preventDefault(); // Stop window scrolling inside iframes!
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Loop Handler
  useEffect(() => {
    if (gameState !== 'active') {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return;
    }

    let lastTicks = performance.now();

    const updateFrame = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTicks) / 1000, 0.1); // Clamp extreme lag jumps
      lastTicks = now;

      // 1. Tick Timers down
      setTimeLeft((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          handleRoundCleared();
          return 0;
        }
        return next;
      });

      // Power-up count downs
      setShieldTimer((s) => Math.max(s - delta, 0));
      setSpeedTimer((s) => Math.max(s - delta, 0));
      setRadarTimer((s) => Math.max(s - delta, 0));

      // 2. Keyboard steer Submarine
      let dx = 0;
      let dy = 0;
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy = -1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy = 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx = -1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx = 1;

      if (dx !== 0 || dy !== 0) {
        // Hypotenuse normalize
        const length = Math.sqrt(dx * dx + dy * dy);
        const baseSpeed = 160 + (speedTimer > 0 ? 110 : 0); // 160px per sec
        const moveDist = (dx / length) * baseSpeed * delta;
        const moveDistY = (dy / length) * baseSpeed * delta;

        setSubX((prev) => Math.max(25, Math.min(prev + moveDist, 775)));
        setSubY((prev) => Math.max(25, Math.min(prev + moveDistY, 425)));
      }

      // Read current values via React-ref bypass state delay inside loops
      // Check shelter statuses
      const activeShield = shieldTimer > 0;

      // 3. Bloop Nuclear Bomb attack trigger cycle
      // Every 16 seconds trigger a Bloop siren!
      setTimeLeft((tVal) => {
        const timeElapsedSinceLastBloop = lastBloopTriggerTime.current - tVal;
        if (timeElapsedSinceLastBloop > 17 && !bloopActive && tVal > 6) {
          triggerBloopAttack(tVal);
        }
        return tVal;
      });

      setBloopTimer((bVal) => {
        if (bVal !== null) {
          const nextVal = bVal - delta;
          if (nextVal <= 0) {
            triggerNuclearExplosion(activeShield);
            return null;
          }
          return nextVal;
        }
        return null;
      });

      // 4. Update falling Debris field
      setDebris((prevDebris) => {
        return prevDebris.map((deb) => {
          let ny = deb.y + deb.speed * 85 * delta;
          let nx = deb.x;

          // Hit bottom: respawn at top
          if (ny > 450) {
            ny = -50;
            nx = Math.random() * 760 + 20;
          }

          // Check sub collision
          setSubX((sx) => {
            setSubY((sy) => {
              const dx = sx - nx;
              const dy = sy - ny;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < (deb.size / 2 + 18) && !activeShield) {
                // Take hit!
                audio.playDefeat();
                damageSubmarine(20);
                // Force debris to respawn
                ny = -60;
                nx = Math.random() * 760 + 20;
              }
              return sy;
            });
            return sx;
          });

          return { ...deb, y: ny, x: nx };
        });
      });

      // 5. Update Shockwaves expansion
      setShockwaves((prevShock) => {
        // Expand radius
        const updated = prevShock.map((sh) => {
          const nr = sh.radius + sh.speed * 40 * delta;

          // Check Sub overlapping expanding rim
          setSubX((sx) => {
            setSubY((sy) => {
              const dx = sx - sh.x;
              const dy = sy - sh.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              // If submarine is right on top of the expanding ring wave outline (width ~10px)
              if (Math.abs(dist - nr) < 14 && !activeShield) {
                audio.playDefeat();
                damageSubmarine(15);
                
                // Repel submarine (push back)
                const pushX = (dx / dist) * 45;
                const pushY = (dy / dist) * 45;
                setSubX((prevX) => Math.max(25, Math.min(prevX + pushX, 775)));
                setSubY((prevY) => Math.max(25, Math.min(prevY + pushY, 425)));
              }
              return sy;
            });
            return sx;
          });

          return { ...sh, radius: nr };
        }).filter((sh) => sh.radius < sh.maxRadius); // filter faded waves

        // Randomly spawn new shockwave in higher levels
        if (Math.random() < 0.015 * round && updated.length < 3) {
          updated.push({
            id: `shock-${Math.random()}`,
            x: Math.random() * 600 + 100,
            y: Math.random() * 300 + 70,
            radius: 5,
            maxRadius: 130 + round * 10,
            speed: 1.2 + round * 0.25
          });
        }

        return updated;
      });

      // 6. Update Radiation cloud slow drains
      setRadiationZones((rads) => {
        rads.forEach((rz) => {
          setSubX((sx) => {
            setSubY((sy) => {
              const dx = sx - rz.x;
              const dy = sy - rz.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < rz.radius && !activeShield) {
                // Small slow poison drag HP
                damageSubmarine(12 * delta);
              }
              return sy;
            });
            return sx;
          });
        });
        return rads;
      });

      // 7. Float powerups in randomly
      setPowerUps((prevP) => {
        const updated = [...prevP];
        if (Math.random() < 0.003 && updated.length < 2) {
          const types: PowerUp['type'][] = ['shield', 'speed', 'health_pack', 'radar'];
          if (Math.random() < 0.25) types.push('heart'); // Heart is rarer
          const chosen = types[Math.floor(Math.random() * types.length)];

          updated.push({
            id: `pw-${Math.random()}`,
            type: chosen,
            x: Math.random() * 700 + 50,
            y: Math.random() * 320 + 50
          });
        }

        // Collect powerups
        return updated.map((p) => {
          let collected = false;
          setSubX((sx) => {
            setSubY((sy) => {
              const dx = sx - p.x;
              const dy = sy - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 32) {
                collected = true;
                applyPowerUp(p.type);
              }
              return sy;
            });
            return sx;
          });
          return collected ? null : p;
        }).filter(Boolean) as PowerUp[];
      });

      // 8. Menacingly update Giant Monster Fish (Dheer Level 4 Threat)
      setMonsterX((mx) => {
        const dx = subX - mx;
        const dy = subY - monsterY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 35 + round * 10; // Menacing but dodgeable
        const mvx = (dx / dist) * speed * delta;
        const nextMx = Math.max(20, Math.min(mx + mvx, 780));
        
        // Damage check when in deep contact
        if (dist < 40 && !activeShield) {
          damageSubmarine(35 * delta); // 35 HP per second of touch
        }
        return nextMx;
      });

      setMonsterY((my) => {
        const dx = subX - monsterX;
        const dy = subY - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 35 + round * 10;
        const mvy = (dy / dist) * speed * delta;
        return Math.max(20, Math.min(my + mvy, 430));
      });

      loopRef.current = requestAnimationFrame(updateFrame);
    };

    loopRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameState, subX, subY, round, bloopActive, shieldTimer, speedTimer, radarTimer, monsterX, monsterY]);

  const damageSubmarine = (amount: number) => {
    setHealth((prev) => {
      const next = prev - amount;
      if (next <= 0) {
        handleSubDeflated();
        return 0;
      }
      return next;
    });
  };

  const applyPowerUp = (type: PowerUp['type']) => {
    audio.playPowerUp();
    setScore((s) => s + 50);

    switch (type) {
      case 'shield':
        audio.playShield();
        setShieldTimer(6.0);
        break;
      case 'speed':
        audio.playSpeed();
        setSpeedTimer(7.5);
        break;
      case 'health_pack':
        audio.playHealth();
        setHealth(100);
        break;
      case 'heart':
        setLives((l) => Math.min(l + 1, 5));
        break;
      case 'radar':
        setRadarTimer(10.0);
        break;
    }
  };

  const triggerBloopAttack = (currentTimerVal: number) => {
    audio.playSiren();
    setBloopActive(true);
    setBloopTimer(5.0); // 5 seconds to take shelter!
    lastBloopTriggerTime.current = currentTimerVal;
  };

  const triggerNuclearExplosion = (hasActiveShield: boolean) => {
    // 1. Flash effect
    setNuclearFlash(true);
    audio.playNuclearExplosion();

    // Reset alert
    setBloopActive(false);

    // 2. Resolve survivor safety
    // Sub must be within any shelter circle radius
    let isSafe = false;
    let closestCaveName = '';

    shelters.forEach((cave) => {
      const dx = subX - cave.x;
      const dy = subY - cave.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cave.radius) {
        isSafe = true;
        closestCaveName = cave.name;
      }
    });

    if (isSafe) {
      audio.playSuccess();
      setScore((s) => s + 100);
    } else if (hasActiveShield) {
      // Shield saves!
      audio.playShield();
      setScore((s) => s + 50);
    } else {
      // Big blast hit!
      damageSubmarine(65);
    }

    setTimeout(() => {
      setNuclearFlash(false);
    }, 450);
  };

  const handleSubDeflated = () => {
    setLives((l) => {
      const nextLives = l - 1;
      if (nextLives <= 0) {
        audio.playDefeat();
        setGameState('game_over');
        return 0;
      } else {
        // Soft spawn back in center with partial shield
        setHealth(100);
        setSubX(400);
        setSubY(225);
        setShieldTimer(3.5); // Respawn shield protects you
        return nextLives;
      }
    });
  };

  const handleRoundCleared = () => {
    audio.playSuccess();
    setScore((s) => s + 200);
    if (round < 5) {
      setGameState('round_success');
    } else {
      setGameState('victory');
    }
  };

  // Keyboard button click emulation
  const clickSteer = (dir: 'up' | 'down' | 'left' | 'right') => {
    const spaceOffset = 36;
    switch (dir) {
      case 'up': setSubY((y) => Math.max(25, y - spaceOffset)); break;
      case 'down': setSubY((y) => Math.min(425, y + spaceOffset)); break;
      case 'left': setSubX((x) => Math.max(25, x - spaceOffset)); break;
      case 'right': setSubX((x) => Math.min(775, x + spaceOffset)); break;
    }
    audio.playClick();
  };

  return (
    <div className="relative min-h-[600px] w-full bg-black rounded-2xl border-2 border-[#ae2012] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100 shadow-[inset_0_0_50px_rgba(174,32,18,0.25)] animate-swim-slow" id="l4-bloop-root">
      
      {/* Heavy Red Alarm Strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ae2012] via-orange-600 to-red-800" />

      {/* Screen flash nuclear blast */}
      {nuclearFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* HUD Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#ae2012]/35 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/20 text-[#ae2012] rounded-xl border border-[#ae2012]/40 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-white bg-[#ae2012] px-2.5 py-0.5 rounded font-mono font-black tracking-wider uppercase block w-fit mb-1">LEVEL 4 - EXPERT</span>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 uppercase italic">
              Survive Nuclear Bloop! <Flame className="w-4.5 h-4.5 text-red-500 animate-ping" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2 hover:bg-slate-800/80 rounded-lg border border-slate-700/50 text-slate-300 transition-colors cursor-pointer"
            title="Toggle Mute"
            id="l4-sound-btn"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-500 animate-pulse" /> : <Volume2 className="w-5 h-5 text-red-400" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-lg bg-red-950/20 border border-[#ae2012]/50 font-mono text-sm shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            <span className="text-[#ae2012] font-extrabold text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* Intro Boarding */}
      {gameState === 'intro' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-6 z-10 max-w-2xl mx-auto" id="l4-intro">
          <div className="p-5 bg-red-950/40 border border-red-500/30 rounded-full mb-3 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <Skull className="w-16 h-16 text-red-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest leading-none">THE BLOOP HAS AWAKENED!</h2>
          <p className="text-slate-300 text-sm leading-relaxed mt-2.5">
            A giant mysterious creature of the deep has surfaced in deep waters. It is extremely angry. When it surfaces... it will charge a 
            <span className="text-red-400 font-bold"> nuclear bomb</span>. Your mission: pilot your submarine to survive. There is no easy way out.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 text-[11px] font-mono font-semibold uppercase text-slate-400">
            <span className="p-2 bg-slate-900 border border-red-950 rounded bg-opacity-70">🚨 EXTREME DANGER</span>
            <span className="p-2 bg-slate-900 border border-red-950 rounded bg-opacity-70">🕒 60 SECONDS TRIAL</span>
            <span className="p-2 bg-slate-900 border border-red-950 rounded bg-opacity-70">💀 ONE MISTAKE = INJURY</span>
          </div>

          <button
            type="button"
            onClick={startLevel4}
            className="mt-6 px-10 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold tracking-wider uppercase rounded-xl shadow-lg border border-red-400 transition-all active:scale-95"
            id="start-lvl4-btn"
          >
            I Accept the Challenge <Play className="w-4 h-4 inline fill-white ml-1" />
          </button>
        </div>
      )}

      {/* Active Sub Arena Grid */}
      {(gameState === 'active' || gameState === 'round_success' || gameState === 'game_over') && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 w-full h-full z-10" id="l4-gameplay-root">
          
          {/* Main Action Field */}
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Warning Banner Bar */}
            {bloopActive && bloopTimer !== null && (
              <div className="py-2.5 px-4 bg-red-950/80 border-2 border-red-600 rounded-xl flex items-center justify-between text-center animate-pulse mb-3 select-none" id="siren-banner">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-spin" />
                  <span className="text-rose-400 text-xs font-mono font-bold tracking-wider">ALERT: BLOOP DETECTED! BOMB CHARGING! GET TO SHELTERS!</span>
                </div>
                <span className="text-red-500 font-extrabold font-mono text-lg animate-ping uppercase">{bloopTimer.toFixed(1)}s</span>
              </div>
            )}

            {/* Playfield Area */}
            <div 
              ref={arenaRef}
              className={`relative flex-1 bg-slate-950 border-2 rounded-2xl min-h-[385px] overflow-hidden select-none cursor-crosshair ${
                bloopActive ? 'border-red-600/70 animate-siren' : 'border-indigo-950'
              }`}
              onClick={handleArenaClick}
              id="nuclear-danger-arena"
            >
              {/* Static Shelter Indicators */}
              {shelters.map((cave) => {
                const dx = subX - cave.x;
                const dy = subY - cave.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const subIsSheltered = dist < cave.radius;

                return (
                  <div
                    key={cave.id}
                    className={`absolute rounded-full border-2 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      bloopActive 
                        ? subIsSheltered
                          ? 'bg-emerald-950/65 border-emerald-400 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                          : 'bg-yellow-950/30 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                        : 'bg-indigo-950/10 border-indigo-950'
                    }`}
                    style={{
                      left: `${cave.x - cave.radius}px`,
                      top: `${cave.y - cave.radius}px`,
                      width: `${cave.radius * 2}px`,
                      height: `${cave.radius * 2}px`,
                      zIndex: 5
                    }}
                    id={`shelter-spot-${cave.id}`}
                  >
                    <ShelterIcon className={`w-6 h-6 mb-1 ${bloopActive ? 'text-amber-400 animate-bounce' : 'text-indigo-900'}`} />
                    <span className="text-[8px] font-mono tracking-tighter text-slate-400 leading-none px-1.5 truncate max-w-full">
                      {cave.name}
                    </span>
                    {subIsSheltered && (
                      <span className="text-[7px] text-emerald-400 uppercase font-mono font-black mt-1">SHELTERED ✅</span>
                    )}
                  </div>
                );
              })}

              {/* Submarine Component */}
              <div
                className="absolute transition-all duration-100"
                style={{
                  left: `${subX - 28}px`,
                  top: `${subY - 22}px`,
                  width: '56px',
                  height: '44px',
                  zIndex: 25
                }}
                id="submarine-player-element"
              >
                <SubmarineSvg hasShield={shieldTimer > 0} />
              </div>

              {/* Giant Abyssal Megamouth Fish (Dheer's expert level guardian!) */}
              <div
                className="absolute pointer-events-none select-none transition-all duration-75 flex flex-col items-center justify-center"
                style={{
                  left: `${monsterX - 35}px`,
                  top: `${monsterY - 30}px`,
                  width: '74px',
                  height: '66px',
                  zIndex: 22
                }}
                id="giant-monster-fish-element"
              >
                {/* Floating identity header */}
                <div className="text-[7px] font-mono font-bold text-red-100 bg-[#ae2012] border border-red-400 px-1 py-0.5 rounded scale-90 mb-0.5 leading-none uppercase tracking-widest whitespace-nowrap shadow-md">
                  Abyssal Titan
                </div>
                
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Glowing warning back aura */}
                  <div className="absolute inset-2 bg-red-600 rounded-full blur-[14px] opacity-60 animate-ping" />
                  <div className="absolute inset-0 bg-orange-600 rounded-full blur-[4px] opacity-25" />
                  
                  {/* Dynamic facing fish emoji sprite */}
                  <div className={`text-4xl filter drop-shadow-[0_0_12px_rgba(239,68,68,0.95)] transition-transform duration-300 ${subX < monsterX ? '' : 'scale-x-[-1]'}`}>
                    👹🐟
                  </div>
                  
                  {/* Glowing predator lure light flare */}
                  <div className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" />
                </div>
              </div>

              {/* Falling debris items */}
              {debris.map((deb) => (
                <div
                  key={deb.id}
                  className="absolute rounded-full bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-950 flex items-center justify-center text-center font-bold"
                  style={{
                    left: `${deb.x - deb.size / 2}px`,
                    top: `${deb.y}px`,
                    width: `${deb.size}px`,
                    height: `${deb.size}px`,
                    zIndex: 10
                  }}
                  id={`debris-${deb.id}`}
                >
                  <span className="text-[8px] text-slate-400">🪨</span>
                </div>
              ))}

              {/* Shockwave expanding rings */}
              {shockwaves.map((sh) => (
                <div
                  key={sh.id}
                  className="absolute rounded-full border-2 border-red-500/70 bg-red-500/5 pointer-events-none"
                  style={{
                    left: `${sh.x - sh.radius}px`,
                    top: `${sh.y - sh.radius}px`,
                    width: `${sh.radius * 2}px`,
                    height: `${sh.radius * 2}px`,
                    zIndex: 8
                  }}
                  id={`shockwave-${sh.id}`}
                />
              ))}

              {/* Radiation Zones */}
              {radiationZones.map((rz) => (
                <div
                  key={rz.id}
                  className="absolute rounded-full bg-emerald-500/10 border-2 border-emerald-500/25 pointer-events-none animate-pulse flex items-center justify-center"
                  style={{
                    left: `${rz.x - rz.radius}px`,
                    top: `${rz.y - rz.radius}px`,
                    width: `${rz.radius * 2}px`,
                    height: `${rz.radius * 2}px`,
                    zIndex: 4
                  }}
                  id={`rad-zone-${rz.id}`}
                >
                  <span className="text-emerald-500/35 text-[9px] font-mono uppercase tracking-widest font-black">RADIATION ZONE</span>
                </div>
              ))}

              {/* Floating power-ups */}
              {powerups.map((p) => {
                let symbol = '⭐️';
                let style = 'bg-blue-600 border-blue-400';
                if (p.type === 'shield') { symbol = '🛡️'; style = 'bg-cyan-600 border-cyan-400'; }
                else if (p.type === 'speed') { symbol = '⚡️'; style = 'bg-amber-600 border-amber-400'; }
                else if (p.type === 'health_pack') { symbol = '❤️'; style = 'bg-red-600 border-red-400'; }
                else if (p.type === 'heart') { symbol = '➕'; style = 'bg-emerald-600 border-emerald-400'; }
                else if (p.type === 'radar') { symbol = '📡'; style = 'bg-purple-600 border-purple-400'; }

                return (
                  <div
                    key={p.id}
                    className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs animate-bounce cursor-none ${style}`}
                    style={{
                      left: `${p.x - 16}px`,
                      top: `${p.y - 16}px`,
                      zIndex: 12
                    }}
                    id={`powerup-${p.id}`}
                  >
                    {symbol}
                  </div>
                );
              })}

              {/* HUD pointers to nearest caves when Radar or Bloop Active */}
              {(radarTimer > 0 || bloopActive) && (
                <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/90 border border-purple-950 font-mono text-[9px] text-purple-400 z-30 flex items-center gap-1.5 select-none" id="sonar-active">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                  CO-CAVES SPOTTED (X: 120 / X: 680)
                </div>
              )}

              {/* Inner Round clearing success screen overlays */}
              {gameState === 'round_success' && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center z-40 p-6">
                  <div className="p-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full mb-3">
                    <Trophy className="w-12 h-12" />
                  </div>
                  <h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest">ROUND {round} COMPLETED!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                    Sensational piloting! You survived the severe debris fields and nuclear fallout of Round {round}. 
                    Prepare yourself for the next, even more chaotic trial!
                  </p>
                  <button
                    type="button"
                    onClick={() => initRound(round + 1, lives, health)}
                    className="mt-6 px-10 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs font-mono tracking-wider rounded-lg shadow-lg border border-emerald-300 uppercase active:scale-95"
                    id="next-impossible-round"
                  >
                    Advance to Round {round + 1}
                  </button>
                </div>
              )}

              {gameState === 'game_over' && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center z-40 p-6">
                  <div className="p-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded-full mb-3">
                    <Skull className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest">SUBMARINE DESTROYED!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                    You ran out of structural hulls and emergency lives! The underwater nuclear blast has consumed your remnants.
                  </p>
                  <button
                    type="button"
                    onClick={startLevel4}
                    className="mt-6 px-10 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs font-mono tracking-widest rounded-lg shadow-lg border border-red-400 flex items-center gap-1.5 active:scale-95"
                    id="retry-lvl4-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> RESTART CAMPAIGN
                  </button>
                </div>
              )}

            </div>

            {/* Submarine Touch / Mouse Directional control buttons below the box */}
            <div className="bg-slate-900 border border-indigo-900/20 p-3 rounded-xl mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <span>Steer: WASD / Arrow Keys, Click target in box, or use D-Pad:</span>
              </div>

              {/* D-Pad controls */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => clickSteer('left')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 hover:border-cyan-500 rounded border border-indigo-950 text-xs font-bold font-mono transition-all text-slate-300 active:scale-90"
                >
                  ◀ LEFT
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => clickSteer('up')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 hover:border-cyan-500 rounded border border-indigo-950 text-[10px] font-bold font-mono transition-all text-slate-300 active:scale-90"
                  >
                    ▲ UP
                  </button>
                  <button
                    type="button"
                    onClick={() => clickSteer('down')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 hover:border-cyan-500 rounded border border-indigo-950 text-[10px] font-bold font-mono transition-all text-slate-300 active:scale-90"
                  >
                    ▼ DOWN
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => clickSteer('right')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 hover:border-cyan-500 rounded border border-indigo-950 text-xs font-bold font-mono transition-all text-slate-300 active:scale-90"
                >
                  RIGHT ▶
                </button>
              </div>
            </div>

          </div>

          {/* Right Column statistics monitor */}
          <div className="w-full lg:w-64 bg-slate-900 border border-red-950/30 p-4 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* HUD Round count */}
              <div className="flex items-center justify-between border-b border-red-950 pb-2">
                <span className="text-xs text-slate-400 font-mono font-bold">Chaos Progress</span>
                <span className="text-xs text-red-400 font-mono font-extrabold uppercase">ROUND {round} / 5</span>
              </div>

              {/* Survival Timer Progress */}
              <div className="bg-slate-950 p-3 rounded-xl border border-red-950/40 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">TIMER TO ESCAPE</span>
                <span className="text-3xl font-black font-mono text-red-500 block mt-1 animate-pulse">
                  {timeLeft.toFixed(1)}s
                </span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-red-500 transition-all" style={{ width: `${(timeLeft / 60) * 100}%` }} />
                </div>
              </div>

              {/* Health Indicator Display & Shield status */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-350">
                  <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-emerald-400" /> HULL HEALTH</span>
                  <span className={`${health < 35 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>{Math.round(health)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all ${
                      health < 35 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`} 
                    style={{ width: `${health}%` }} 
                  />
                </div>
              </div>

              {/* Lives tracker display */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-900/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Lives Left
                </span>
                <div className="flex gap-1 shadow-sm">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full ${
                        idx < lives 
                          ? 'bg-red-500 border border-red-400 shadow-[0_0_5px_rgba(239,68,68,0.2)]' 
                          : 'bg-slate-800 opacity-20'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Buff Indicators */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Subsystem Buffs</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Shield className={`w-3.5 h-3.5 ${shieldTimer > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />
                      Invulnerable Shield
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400">{shieldTimer > 0 ? `${shieldTimer.toFixed(1)}s` : 'OFF'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Zap className={`w-3.5 h-3.5 ${speedTimer > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
                      Speed Overclock
                    </span>
                    <span className="font-mono text-[10px] text-amber-400">{speedTimer > 0 ? `${speedTimer.toFixed(1)}s` : 'OFF'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Eye className={`w-3.5 h-3.5 ${radarTimer > 0 ? 'text-purple-400' : 'text-slate-600'}`} />
                      Shelter Sonar
                    </span>
                    <span className="font-mono text-[10px] text-purple-400">{radarTimer > 0 ? `${radarTimer.toFixed(1)}s` : 'OFF'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/20 rounded-xl leading-relaxed text-[10px] text-slate-300">
              <span className="text-[9px] font-bold text-red-400 block uppercase font-mono mb-1">📢 Emergency Shelter</span>
              <span>
                When the sirens blare "ALERT BLOOP DETECTED", move inside a glowing, shaded shipwreck or obsidian cave center within 5 seconds to survive the nuclear bomb storm!
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Campaign Complete Victory */}
      {gameState === 'victory' && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 text-center max-w-xl mx-auto" id="l4-victory">
          <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-full mb-4 animate-bounce">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-black text-yellow-400 tracking-widest leading-none block">THE BLOOP HAS DEFEATED!</h2>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest block font-mono mt-1">OCEAN DEEP LEGEND UNLOCKED</span>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            Unbelievable accomplishment! You stood against the ultimate fury of Dheer's mythical Bloop, survived all 5 nuclear round storms, 
            and mastered the deep obsidian trenches. You are permanently registered as the bravest explorer of the deep!
          </p>

          <div className="my-6 p-4 bg-slate-900/80 border border-yellow-500/20 rounded-xl w-full min-w-[280px]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">ULTIMATE ESCAPE SCORE</span>
            <span className="text-5xl font-black text-yellow-400 block font-mono mt-1.5">{score} Points</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={startLevel4}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-indigo-950 text-slate-300 text-xs font-bold font-mono tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
              id="replay-lvl4-btn"
            >
              <RotateCcw className="w-4 h-4" /> REPLAY LEVEL 4
            </button>
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs font-mono tracking-widest rounded-xl shadow-lg border border-yellow-300 uppercase active:scale-95"
              id="complete-lvl4-btn"
            >
              Finish Campaign 🏆
            </button>
          </div>
        </div>
      )}

      {/* Nav footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#ae2012]/35 z-10 text-xs text-slate-450 font-semibold">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-[#94d2bd] transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Level 3: Elyas Squid
        </button>
        <span className="font-mono text-red-500 animate-pulse text-[11px] uppercase tracking-wider font-bold">Impossible • Dheer Bloop</span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-[#94d2bd] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          Finish Game →
        </button>
      </div>

    </div>
  );
};
