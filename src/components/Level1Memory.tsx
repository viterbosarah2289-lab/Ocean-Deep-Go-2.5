/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from 'react';
import { MEET_FISH_LIST, BONUS_FISH_LIST, Fish } from '../types';
import { FishSvg } from './FishSvg';
import { audio } from '../utils/audio';
import { 
  ShieldCheck, Eye, EyeOff, BrainCircuit, Play, RotateCcw, 
  Award, Sparkles, ChevronRight, Volume2, VolumeX, ArrowRight,
  Brain, Shield, GlassWater, Waves, CheckCircle2, RefreshCw
} from 'lucide-react';

interface Level1MemoryProps {
  onComplete: (score: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

interface Question {
  questionText: string;
  options: Array<{
    label: string;
    isCorrect: boolean;
    fishId?: string; // If we want to show a small fish SVG next to it
  }>;
}

export const Level1Memory: React.FC<Level1MemoryProps> = ({ onComplete, onPrev, onNext }) => {
  const [subLevel, setSubLevel] = useState<1 | 2 | 3>(1);
  const [subLevelPhase, setSubLevelPhase] = useState<'select' | 'playing'>('select');

  const [phase, setPhase] = useState<'memorize' | 'cover' | 'test' | 'results' | 'bonus'>('memorize');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [testQuestionIdx, setTestQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [bonusTarget, setBonusTarget] = useState<Fish | null>(null);
  const [bonusGrid, setBonusGrid] = useState<Fish[]>([]);
  const [bonusAttempts, setBonusAttempts] = useState<number>(0);
  const [bonusCollected, setBonusCollected] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());

  // Dynamic Questions List generated on game start
  const [questions, setQuestions] = useState<Question[]>([]);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  // Helper to determine fish lineup for the active subLevel
  const getFishlineup = (lvl: number): Fish[] => {
    if (lvl === 1) {
      // 4 fish (Easy)
      return MEET_FISH_LIST.slice(0, 4);
    } else if (lvl === 2) {
      // 6 fish (Medium)
      return [...MEET_FISH_LIST, BONUS_FISH_LIST[0]];
    } else {
      // 9 fish (Hard / Expert 5G mode)
      return [
        ...MEET_FISH_LIST, 
        BONUS_FISH_LIST[0], // parrotfish
        BONUS_FISH_LIST[1], // moorish_idol
        BONUS_FISH_LIST[2], // pufferfish
        BONUS_FISH_LIST[3]  // royal_gramma
      ];
    }
  };

  const getMemorizeTime = (lvl: number) => {
    if (lvl === 1) return 18;
    if (lvl === 2) return 12;
    return 8; // Very high intensity speed
  };

  // Generate customized, non-static questions matching the selected subLevel lineup!
  const generateQuestionsForLevel = (lvl: number): Question[] => {
    const lineup = getFishlineup(lvl);

    if (lvl === 1) {
      return [
        {
          questionText: "Which of these fish is the orange 'Clownfish' that lives inside biological protective sea anemones?",
          options: [
            { label: "Clownfish", isCorrect: true, fishId: "clownfish" },
            { label: "Blue Tang", isCorrect: false, fishId: "blue_tang" },
            { label: "Angelfish", isCorrect: false, fishId: "angelfish" },
            { label: "Butterflyfish", isCorrect: false, fishId: "butterflyfish" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which ocean dweller carries the scientific name 'Pterophyllum' with a majestic high triangular body?",
          options: [
            { label: "Angelfish", isCorrect: true },
            { label: "Blue Tang", isCorrect: false },
            { label: "Butterflyfish", isCorrect: false },
            { label: "Clownfish", isCorrect: false }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which species has royal indigo-blue body plates, black bands, and a distinct bright yellow wedge on its tail fin?",
          options: [
            { label: "Blue Tang", isCorrect: true, fishId: "blue_tang" },
            { label: "Butterflyfish", isCorrect: false, fishId: "butterflyfish" },
            { label: "Clownfish", isCorrect: false, fishId: "clownfish" },
            { label: "Angelfish", isCorrect: false, fishId: "angelfish" }
          ].sort(() => Math.random() - 0.5)
        }
      ];
    } else if (lvl === 2) {
      return [
        {
          questionText: "Which of these fish matches descriptions: 'Flamboyant red zebra stripes, carrying fan-like venomous spike rays'?",
          options: [
            { label: "Lionfish", isCorrect: true, fishId: "lionfish" },
            { label: "Angelfish", isCorrect: false, fishId: "angelfish" },
            { label: "Parrotfish", isCorrect: false, fishId: "parrotfish" },
            { label: "Clownfish", isCorrect: false, fishId: "clownfish" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which of these is the newly introduced 'Parrotfish' carrying beak-jaw bones to parse rock sands?",
          options: [
            { label: "Parrotfish", isCorrect: true, fishId: "parrotfish" },
            { label: "Blue Tang", isCorrect: false, fishId: "blue_tang" },
            { label: "Butterflyfish", isCorrect: false, fishId: "butterflyfish" },
            { label: "Lionfish", isCorrect: false, fishId: "lionfish" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which fish matches: 'Bright yellow disk shape, highly intricate dark mask markings across face'?",
          options: [
            { label: "Butterflyfish", isCorrect: true, fishId: "butterflyfish" },
            { label: "Parrotfish", isCorrect: false, fishId: "parrotfish" },
            { label: "Clownfish", isCorrect: false, fishId: "clownfish" },
            { label: "Blue Tang", isCorrect: false, fishId: "blue_tang" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Identify the species that was NOT shown at all in the original 6-fish shipwreck crew:",
          options: [
            { label: "Moorish Idol (Zanclus)", isCorrect: true, fishId: "moorish_idol" },
            { label: "Lionfish (Pterois)", isCorrect: false, fishId: "lionfish" },
            { label: "Blue Tang (Paracanthurus)", isCorrect: false, fishId: "blue_tang" },
            { label: "Parrotfish (Scaridae)", isCorrect: false, fishId: "parrotfish" }
          ].sort(() => Math.random() - 0.5)
        }
      ];
    } else {
      // Level 3 (Hard / 9 fish)
      return [
        {
          questionText: "Which fish is the 'Moorish Idol' carrying steep contrasting black-and-yellow stripes with a tall streamer?",
          options: [
            { label: "Moorish Idol", isCorrect: true, fishId: "moorish_idol" },
            { label: "Royal Gramma", isCorrect: false, fishId: "royal_gramma" },
            { label: "Pufferfish", isCorrect: false, fishId: "pufferfish" },
            { label: "Parrotfish", isCorrect: false, fishId: "parrotfish" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which species features an electric split: Magenta front body fading to sunshine gold back?",
          options: [
            { label: "Royal Gramma", isCorrect: true, fishId: "royal_gramma" },
            { label: "Butterflyfish", isCorrect: false, fishId: "butterflyfish" },
            { label: "Angelfish", isCorrect: false, fishId: "angelfish" },
            { label: "Moorish Idol", isCorrect: false, fishId: "moorish_idol" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "What is the scientific taxonomic family identifier of the pufferfish that swells into a spherical spine ball?",
          options: [
            { label: "Tetraodontidae", isCorrect: true },
            { label: "Chaetodontidae", isCorrect: false },
            { label: "Amphiprioninae", isCorrect: false },
            { label: "Scaridae", isCorrect: false }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Identify the fish with a sandy bulbous skin outline covered in soft protective spines:",
          options: [
            { label: "Pufferfish", isCorrect: true, fishId: "pufferfish" },
            { label: "Parrotfish", isCorrect: false, fishId: "parrotfish" },
            { label: "Royal Gramma", isCorrect: false, fishId: "royal_gramma" },
            { label: "Lionfish", isCorrect: false, fishId: "lionfish" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          questionText: "Which of the following ocean predators was ABSENT in our hydrothermal 9-fish volcanic lineup?",
          options: [
            { label: "Giant Great White Shark", isCorrect: true },
            { label: "Pufferfish", isCorrect: false, fishId: "pufferfish" },
            { label: "Moorish Idol", isCorrect: false, fishId: "moorish_idol" },
            { label: "Royal Gramma", isCorrect: false, fishId: "royal_gramma" }
          ].sort(() => Math.random() - 0.5)
        }
      ];
    }
  };

  const startSelectedSublevel = (lvl: number) => {
    audio.playPowerUp();
    setSubLevel(lvl);
    setQuestions(generateQuestionsForLevel(lvl));
    setScore(0);
    setTestQuestionIdx(0);
    setSelectedAnswers([]);
    setBonusCollected(false);
    
    setTimeLeft(getMemorizeTime(lvl));
    setSubLevelPhase('playing');
    setPhase('memorize');
  };

  // Setup Memorize Timer
  useEffect(() => {
    if (subLevelPhase === 'playing' && phase === 'memorize') {
      const initialTime = getMemorizeTime(subLevel);
      setTimeLeft(initialTime);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoTransitionToCover();
            return 0;
          }
          if (prev <= 4) {
            audio.playClick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, subLevelPhase, subLevel]);

  const autoTransitionToCover = () => {
    audio.playSwoosh();
    setPhase('cover');
  };

  const startTesting = () => {
    audio.playBubble();
    setSelectedAnswers([]);
    setTestQuestionIdx(0);
    setPhase('test');
  };

  const handleAnswerQuestion = (isCorrect: boolean) => {
    const pointsPerQuestion = Math.round(100 / questions.length);
    if (isCorrect) {
      setScore((prev) => prev + pointsPerQuestion);
      audio.playSuccess();
    } else {
      audio.playDefeat();
    }

    if (testQuestionIdx < questions.length - 1) {
      setTestQuestionIdx((prev) => prev + 1);
    } else {
      setPhase('results');
    }
  };

  // Setup Bonus Round
  const startBonusRound = () => {
    audio.playBubble();
    
    // Choose 1 target fish from Bonus pool that is NOT in current lineup
    const currentLineupIds = getFishlineup(subLevel).map(f => f.id);
    const availableBonusPool = BONUS_FISH_LIST.filter(f => !currentLineupIds.includes(f.id));
    
    // Fallback if none available
    const chosenPool = availableBonusPool.length > 0 ? availableBonusPool : BONUS_FISH_LIST;
    const randomBonus = chosenPool[Math.floor(Math.random() * chosenPool.length)];
    
    // Combine lineup + target bonus
    const grid = [...getFishlineup(subLevel), randomBonus];
    // Shuffle the grid so position is randomized
    const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);

    setBonusTarget(randomBonus);
    setBonusGrid(shuffledGrid);
    setBonusAttempts(0);
    setBonusCollected(false);
    setPhase('bonus');
  };

  const handleBonusClick = (clickedFishId: string) => {
    if (!bonusTarget) return;
    setBonusAttempts((prev) => prev + 1);

    if (clickedFishId === bonusTarget.id) {
      audio.playPowerUp();
      setScore((prev) => prev + 50);
      setBonusCollected(true);
    } else {
      audio.playDefeat();
    }
  };

  const triggerReset = () => {
    setSubLevelPhase('select');
  };

  return (
    <div className="relative min-h-[600px] w-full bg-[#001424] rounded-2xl border-2 border-[#005f73] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100 shadow-[inset_0_0_60px_rgba(0,95,115,0.15)]" id="l1-memory-root">
      
      {/* Wave glow header decor */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-400 animate-pulse" />
      
      {/* HUD Bar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#005f73]/40 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#005f73]/20 text-cyan-400 rounded-xl border border-cyan-500/20 animate-pulse">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 tracking-widest font-mono font-bold uppercase block">STAGES 1-3 • TANI</span>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
              Bioluminescent Mind Labs <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound, Restart */}
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2.5 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Toggle Mute"
            id="toggle-mute-btn"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-xl bg-black/40 border border-[#005f73]/50 font-mono text-sm shadow-[0_0_10px_rgba(34,211,238,0.1)]">
            <span className="text-cyan-400 font-black text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* STAGE SELECT VIEW */}
      {subLevelPhase === 'select' && (
        <div className="flex-1 flex flex-col justify-center items-center py-6 z-10" id="sublevel-select-menu">
          <div className="text-center max-w-lg mb-8">
            <span className="px-3.5 py-1 rounded-full bg-cyan-950/80 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/20 uppercase tracking-widest block w-fit mx-auto mb-3">CONCURRENT CHALLENGES</span>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Select Tani's Memory Depth</h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Ascend from the sunny shallow coral reefs to the high-pressure submarine trenches. Higher levels require rapid biological classification speeds!
            </p>
          </div>

          {/* Sublevel Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl px-4">
            
            {/* Level 1 Card */}
            <button
              type="button"
              onClick={() => startSelectedSublevel(1)}
              className="group relative bg-[#001c2e] border-2 border-indigo-950 hover:border-cyan-500/60 p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:scale-[1.02] flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none rounded-2xl" />
              <div>
                <span className="px-2 py-0.5 bg-blue-950 text-cyan-400 text-[9px] font-mono font-bold rounded uppercase tracking-wider">Level 1 - Easy</span>
                <h3 className="text-lg font-black text-white uppercase italic mt-2">Shallow Coral</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Memorize <span className="text-white font-bold">4 simple species</span> in <span className="text-white font-bold">18 seconds</span>. Great for warmups and testing foundational marine graphics.
                </p>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[11px] font-mono text-cyan-400 group-hover:underline">
                <span>WARP DRIVE INTRO</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Level 2 Card */}
            <button
              type="button"
              onClick={() => startSelectedSublevel(2)}
              className="group relative bg-[#001c2e] border-2 border-indigo-950 hover:border-emerald-500/60 p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-[1.02] flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none rounded-2xl" />
              <div>
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 text-[9px] font-mono font-bold rounded uppercase tracking-wider">Level 2 - Medium</span>
                <h3 className="text-lg font-black text-white uppercase italic mt-2">Sunken Shipwreck</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Memory grid expands to <span className="text-white font-bold">6 colorful fish</span> in only <span className="text-white font-bold">12 seconds</span>! Includes poisonous jellyfish distractors.
                </p>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[11px] font-mono text-emerald-400 group-hover:underline">
                <span>DECRYPT MATRIX</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Level 3 Card */}
            <button
              type="button"
              onClick={() => startSelectedSublevel(3)}
              className="group relative bg-[#001c2e] border-2 border-indigo-950 hover:border-amber-500/60 p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:scale-[1.02] flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 pointer-events-none rounded-2xl" />
              <div>
                <span className="px-2 py-0.5 bg-amber-950/80 text-amber-500 text-[9px] font-mono font-bold rounded uppercase tracking-wider">Level 3 - Expert</span>
                <h3 className="text-lg font-black text-white uppercase italic mt-2">Abyssal Trench</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Insane scale! Memorize <span className="text-white font-bold">9 glowing creatures</span> in a sheer <span className="text-white font-bold">8 seconds</span>. Tested with high-precision scientific names.
                </p>
              </div>
              <div className="flex items-center gap-1 mt-4 text-[11px] font-mono text-amber-400 group-hover:underline">
                <span>CRITICAL REVELATION</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>
      )}

      {/* CORE PLAYING PHASES */}
      {subLevelPhase === 'playing' && (
        <div className="flex-1 flex flex-col justify-between" id="tani-active-stages">
          
          {phase === 'memorize' && (
            <div className="flex-1 flex flex-col justify-between items-center py-4 z-10" id="phase-memorize">
              <div className="text-center max-w-lg mb-4">
                <span className="text-[10px] font-mono uppercase bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-500/20 text-cyan-400">STAGE {subLevel} IN PROGRESS</span>
                <p className="text-xs text-slate-350 mt-1.5 leading-relaxed">Scan the biological elements. Lock their matching coordinates, stripes, and scientific identifiers into your visual matrix!</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-red-950/80 text-red-400 font-mono text-xs border border-red-500/20 flex items-center gap-1.5 shadow-lg">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    Bioluminescence Decay: {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Core Grid of Fish scaled dynamically */}
              <div className={`grid gap-4 w-full max-w-4xl px-4 py-2 justify-center mx-auto ${
                subLevel === 1 ? 'grid-cols-2 sm:grid-cols-4' : subLevel === 2 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' : 'grid-cols-3 sm:grid-cols-5 md:grid-cols-9'
              }`}>
                {getFishlineup(subLevel).map((fish) => (
                  <div 
                    key={fish.id} 
                    className="group relative flex flex-col items-center p-3 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] overflow-hidden text-center min-w-[90px]"
                    id={`memo-fish-card-${fish.id}`}
                  >
                    {/* Glow Backdrop */}
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1">
                      <FishSvg id={fish.id} animate={true} />
                    </div>
                    <h3 className="text-xs font-bold text-slate-100 truncate w-full">{fish.name}</h3>
                    <span className="text-[9px] text-cyan-400 font-mono italic opacity-90 truncate w-full">{fish.scientific}</span>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={autoTransitionToCover}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs tracking-wider"
                  id="ready-btn"
                >
                  I got it! Skip Clock <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {phase === 'cover' && (
            <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 text-center" id="phase-cover">
              <div className="p-6 bg-cyan-950/40 border border-[#005f73]/55 rounded-full mb-4 animate-bounce">
                <EyeOff className="w-16 h-16 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">SPECTRAL OCCLUSION ACTIVE</h2>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed mb-6 mt-1">
                Visual data has been safely scrubbed from telemetry display. Prepare to execute neural recall sequence for Level {subLevel}.
              </p>

              <button
                type="button"
                onClick={startTesting}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold tracking-widest uppercase rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs border border-cyan-300/40"
                id="start-memory-test-btn"
              >
                Access recall terminal <Play className="w-4 h-4 fill-slate-950" />
              </button>
            </div>
          )}

          {phase === 'test' && (
            <div className="flex-1 flex flex-col justify-between items-center py-4 z-10 w-full" id="phase-test">
              {/* Question Indicator */}
              <div className="w-full max-w-2xl bg-slate-950 p-4 rounded-xl border border-indigo-950 mb-6">
                <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono mb-2">
                  <span>RECALL QUESTION {testQuestionIdx + 1} OF {questions.length}</span>
                  <span>ACCURACY: {Math.round(((testQuestionIdx) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300" 
                    style={{ width: `${((testQuestionIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Dynamic Q & A Generator using robust index arrays */}
              {questions[testQuestionIdx] && (
                <div className="text-center w-full max-w-2xl px-4 animate-fade-in">
                  <h2 className="text-base sm:text-lg font-bold text-white mb-6 leading-relaxed max-w-xl mx-auto">
                    {questions[testQuestionIdx].questionText}
                  </h2>
                  
                  <div className={`grid gap-4 w-full max-w-xl mx-auto ${questions[testQuestionIdx].options.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {questions[testQuestionIdx].options.map((opt, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handleAnswerQuestion(opt.isCorrect)}
                        className="flex flex-col sm:flex-row items-center justify-center p-4 bg-slate-900/90 hover:bg-slate-800 text-left rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all active:scale-98 gap-3"
                      >
                        {opt.fishId && (
                          <div className="w-12 h-12 flex-shrink-0 bg-slate-955 rounded-lg border border-slate-800/60 p-1 flex items-center justify-center">
                            <FishSvg id={opt.fishId} />
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-100 uppercase italic tracking-wide">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-4" />
            </div>
          )}

          {phase === 'results' && (
            <div className="flex-1 flex flex-col justify-center items-center py-6 z-10 text-center" id="phase-results">
              <div className="p-4 bg-cyan-950/50 border border-cyan-500/30 rounded-full mb-4">
                <Award className="w-14 h-14 text-cyan-400 animate-spin-slow" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-wider italic">LEVEL {subLevel} MATRIX SECURED</h2>
              <p className="text-slate-400 text-xs max-w-xs mb-4">Neural verification successful. Calibration accuracy evaluated below:</p>
              
              <div className="mb-6 p-4 bg-slate-900/60 border border-cyan-500/20 rounded-xl min-w-[240px]">
                <span className="text-slate-400 text-[10px] uppercase block font-mono">NEURAL DRIFT ACCURACY</span>
                <span className="text-4xl font-extrabold text-cyan-400 font-mono">{score}/100</span>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={triggerReset}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-xl transition-all flex items-center gap-2 active:scale-95 text-xs"
                  id="retry-memory-btn"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" /> STAGE SELECT
                </button>
                <button
                  type="button"
                  onClick={startBonusRound}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 active:scale-95 text-xs uppercase"
                  id="bonus-round-btn"
                >
                  Start Bonus Round! <Sparkles className="w-4 h-4 fill-slate-950" />
                </button>
              </div>
            </div>
          )}

          {phase === 'bonus' && (
            <div className="flex-1 flex flex-col justify-between items-center py-4 z-10 w-full" id="phase-bonus">
              <div className="text-center max-w-lg mb-4">
                <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] border border-cyan-400/30 uppercase tracking-widest font-black block w-fit mx-auto mb-2">BONUS ANOMALY HUNT</span>
                <h2 className="text-xl font-bold text-white mb-2">Can you intercept the stranger?</h2>
                {bonusTarget && !bonusCollected ? (
                  <p className="text-xs text-slate-300">
                    Find the <span className="font-extrabold text-cyan-400 uppercase underline decoration-cyan-500">{bonusTarget.name}</span> in the biological matrix below.
                    This entity was ABSENT in your Level {subLevel} study material!
                  </p>
                ) : (
                  <p className="text-sm text-emerald-400 font-semibold uppercase font-mono">Trophy verification complete! Outstanding eye-mind coordination.</p>
                )}
              </div>

              {/* Grid including the bonus fish */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full max-w-4xl px-4 py-2">
                {bonusGrid.map((fish, idx) => {
                  const isSelected = selectedAnswers.includes(fish.id);
                  const isTarget = bonusTarget?.id === fish.id;

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        if (bonusCollected) return;
                        setSelectedAnswers((prev) => [...prev, fish.id]);
                        handleBonusClick(fish.id);
                      }}
                      disabled={bonusCollected}
                      className={`p-3 bg-slate-900 border rounded-2xl flex flex-col items-center justify-between transition-all duration-350 ${
                        bonusCollected && isTarget 
                          ? 'border-emerald-500 bg-emerald-950/20 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : isSelected && !isTarget
                          ? 'border-red-500/30 bg-red-950/10 opacity-30 scale-95 cursor-not-allowed'
                          : 'border-slate-800 hover:border-cyan-400 hover:scale-105'
                      }`}
                    >
                      <div className="w-14 h-14">
                        <FishSvg id={fish.id} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-350 mt-2 block truncate w-full text-center">
                        {bonusCollected && isTarget ? fish.name : 'Coordinates'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={triggerReset}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-medium transition-all active:scale-95 text-xs uppercase font-mono"
                  id="replay-level-1-btn"
                >
                  Stage Selector
                </button>

                <button
                  type="button"
                  onClick={() => onComplete(score)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5 text-xs uppercase"
                  id="finish-level-1-btn"
                >
                  Level 2: Noam Board Game <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Nav footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#005f73]/40 z-10 text-xs text-slate-400">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-cyan-400 transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Main Menu
        </button>
        <span className="font-mono text-[#8ecae6]/80 text-[10px] uppercase tracking-wider font-bold">
          {subLevelPhase === 'playing' ? `Tani STAGE ${subLevel} ACTIVE` : 'TANI STAGING HUB'}
        </span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-bold"
        >
          Skip Level →
        </button>
      </div>

    </div>
  );
};
