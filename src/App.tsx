/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, Waves, Trophy, Sparkles, Brain, Award, ShieldAlert,
  ChevronRight, Volume2, VolumeX, RefreshCw, Star, Info, Lock, BookOpen,
  Camera, Settings, ShoppingCart
} from 'lucide-react';
import { Level1Memory } from './components/Level1Memory';
import { Level2BoardGame } from './components/Level2BoardGame';
import { Level3Squid } from './components/Level3Squid';
import { Level4Bloop } from './components/Level4Bloop';
import { CodexAndGuide } from './components/CodexAndGuide';
import { audio } from './utils/audio';

type ScreenState = 'menu' | 'level1' | 'level2' | 'level3' | 'level4' | 'campaign_victory';

interface TrophyState {
  level1: boolean;
  level2: boolean;
  level3: boolean;
  level4: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [trophies, setTrophies] = useState<TrophyState>({
    level1: false,
    level2: false,
    level3: false,
    level4: false
  });
  const [levelScores, setLevelScores] = useState<{
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  }>({
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0
  });

  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  
  // Custom cover display modals
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Auto-start extreme Adventure BGM when user interacts with the page
  useEffect(() => {
    const handleStartAudio = () => {
      if (!muted) {
        audio.startAdventureBGM();
      }
    };
    
    // Quick starter trigger on user click or keydown
    window.addEventListener('click', handleStartAudio, { once: true });
    window.addEventListener('keydown', handleStartAudio, { once: true });
    
    // Also trigger if unmuted
    if (!muted) {
      handleStartAudio();
    }
    
    return () => {
      window.removeEventListener('click', handleStartAudio);
      window.removeEventListener('keydown', handleStartAudio);
    };
  }, [muted]);

  // Load persistence configurations
  useEffect(() => {
    const savedScore = localStorage.getItem('ocean_deep_go_score');
    const savedTrophies = localStorage.getItem('ocean_deep_go_trophies');
    const savedLevelScores = localStorage.getItem('ocean_deep_go_level_scores');
    if (savedScore) {
      setTotalScore(parseInt(savedScore, 10));
    }
    if (savedTrophies) {
      try {
        setTrophies(JSON.parse(savedTrophies));
      } catch (e) {
        console.warn('Err loads trophies', e);
      }
    }
    if (savedLevelScores) {
      try {
        setLevelScores(JSON.parse(savedLevelScores));
      } catch (e) {
        console.warn('Err loads level scores', e);
      }
    }
  }, []);

  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  const saveStats = (newScore: number, levelKey?: keyof TrophyState) => {
    const updatedScore = totalScore + newScore;
    setTotalScore(updatedScore);
    localStorage.setItem('ocean_deep_go_score', updatedScore.toString());

    if (levelKey) {
      const updatedTrophies = { ...trophies, [levelKey]: true };
      setTrophies(updatedTrophies);
      localStorage.setItem('ocean_deep_go_trophies', JSON.stringify(updatedTrophies));

      const nextLevelScores = { ...levelScores, [levelKey]: Math.max(levelScores[levelKey as keyof typeof levelScores] || 0, newScore) };
      setLevelScores(nextLevelScores);
      localStorage.setItem('ocean_deep_go_level_scores', JSON.stringify(nextLevelScores));
    }
  };

  const getLevelStars = (levelId: 'level1' | 'level2' | 'level3' | 'level4', scoreVal: number): number => {
    if (scoreVal <= 0) return 0;
    if (levelId === 'level1') {
      if (scoreVal >= 180) return 3;
      if (scoreVal >= 120) return 2;
      return 1;
    }
    if (levelId === 'level2') {
      if (scoreVal >= 400) return 3;
      if (scoreVal >= 250) return 2;
      return 1;
    }
    if (levelId === 'level3') {
      if (scoreVal >= 350) return 3;
      if (scoreVal >= 220) return 2;
      return 1;
    }
    if (levelId === 'level4') {
      if (scoreVal >= 950) return 3;
      if (scoreVal >= 600) return 2;
      return 1;
    }
    return 0;
  };

  const totalStars = 
    getLevelStars('level1', levelScores.level1) +
    getLevelStars('level2', levelScores.level2) +
    getLevelStars('level3', levelScores.level3) +
    getLevelStars('level4', levelScores.level4);

  const renderCardStars = (levelId: 'level1' | 'level2' | 'level3' | 'level4') => {
    const count = getLevelStars(levelId, levelScores[levelId]);
    if (count <= 0) return null;
    return (
      <div className="flex gap-0.5 items-center bg-slate-950/40 px-1.5 py-0.5 rounded border border-yellow-500/10 text-amber-400">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
        ))}
      </div>
    );
  };

  const handleLevel1Completed = (scoreEarned: number) => {
    saveStats(scoreEarned, 'level1');
    setScreen('level2'); // Advance sequentially
  };

  const handleLevel2Completed = (scoreEarned: number) => {
    saveStats(scoreEarned, 'level2');
    setScreen('level3');
  };

  const handleLevel3Completed = (scoreEarned: number) => {
    saveStats(scoreEarned, 'level3');
    setScreen('level4');
  };

  const handleLevel4Completed = (scoreEarned: number) => {
    saveStats(scoreEarned, 'level4');
    setScreen('campaign_victory');
  };

  const isLvl1Unlocked = true;
  const isLvl2Unlocked = trophies.level1;
  const isLvl3Unlocked = trophies.level1 && trophies.level2;
  const isLvl4Unlocked = trophies.level1 && trophies.level2 && trophies.level3;

  const handleSelectLevel = (levelId: ScreenState, isUnlocked: boolean) => {
    if (!isUnlocked) {
      audio.playDefeat();
      alert(`🔒 level locked! Please complete the prior ocean challenges to unlock Level ${levelId.substring(5)}.`);
      return;
    }
    audio.playClick();
    setScreen(levelId);
  };

  const resetAllCampaignStats = () => {
    if (confirm('Are you sure you want to clear your high scores and trophies?')) {
      audio.playDefeat();
      setTotalScore(0);
      setTrophies({
        level1: false,
        level2: false,
        level3: false,
        level4: false
      });
      setLevelScores({
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0
      });
      localStorage.removeItem('ocean_deep_go_score');
      localStorage.removeItem('ocean_deep_go_trophies');
      localStorage.removeItem('ocean_deep_go_level_scores');
    }
  };

  const handlePrevLevel = () => {
    audio.playClick();
    if (screen === 'level1') setScreen('menu');
    else if (screen === 'level2') handleSelectLevel('level1', isLvl1Unlocked);
    else if (screen === 'level3') handleSelectLevel('level2', isLvl2Unlocked);
    else if (screen === 'level4') handleSelectLevel('level3', isLvl3Unlocked);
    else if (screen === 'campaign_victory') handleSelectLevel('level4', isLvl4Unlocked);
  };

  const handleNextLevel = () => {
    audio.playClick();
    if (screen === 'menu') handleSelectLevel('level1', isLvl1Unlocked);
    else if (screen === 'level1') handleSelectLevel('level2', isLvl2Unlocked);
    else if (screen === 'level2') handleSelectLevel('level3', isLvl3Unlocked);
    else if (screen === 'level3') handleSelectLevel('level4', isLvl4Unlocked);
    else if (screen === 'level4') setScreen('campaign_victory');
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 md:px-8 bg-[#000814] text-slate-100 flex flex-col items-center justify-between font-sans relative overflow-x-hidden select-none" id="main-scaffold-container">
      
      {/* Drifting background bubbles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-x-10 bottom-0 w-1 bg-[#94d2bd] animate-bubble-slow rounded-full" />
        <div className="absolute inset-x-40 bottom-0 w-1 bg-[#52b788] animate-bubble-medium rounded-full" />
        <div className="absolute inset-x-70 bottom-0 w-1 bg-[#0a9396] animate-bubble-fast rounded-full" />
        <div className="absolute inset-x-90 bottom-0 w-1 bg-[#8ecae6] animate-bubble-slow rounded-full" />
      </div>

      {/* Main Container Core */}
      <div className="w-full max-w-6xl flex-1 flex flex-col justify-between" id="app-wrapper-core">
        
        {/* Navigation Sidebar/Top status */}
        <header className="flex justify-between items-end mb-8 pb-4 border-b-2 border-[#005f73] w-full">
          <div 
            onClick={() => { audio.playClick(); setScreen('menu'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-3 bg-[#001219] text-[#94d2bd] rounded-2xl border border-[#0a9396] group-hover:bg-[#001219]/95 transition-all duration-300 shadow-[0_0_15px_rgba(148,210,189,0.1)]">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black font-sans tracking-tighter uppercase leading-none italic text-[#94d2bd] transition-colors group-hover:text-white">
                Ocean Deep Go
              </h1>
              <span className="text-[#52b788] text-xs font-bold tracking-[0.2em] mt-2 uppercase block">
                Explore • Race • Survive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => { audio.playClick(); setIsCodexOpen(true); }}
              className="p-3 bg-[#001219] hover:bg-[#002d3d] border border-[#0a9396] hover:border-[#94d2bd] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-cyan-400 group/codex shadow-[0_0_10px_rgba(10,147,150,0.1)]"
              title="Open World Codex and Guide"
              id="global-codex-toggle-btn"
            >
              <BookOpen className="w-5 h-5 text-[#94d2bd] group-hover/codex:animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-extrabold hidden sm:inline text-slate-200">Guide</span>
              {totalStars > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black font-mono text-[9px] px-1.5 py-0.5 rounded-full leading-none flex items-center gap-0.5" title="Stars earned">
                  ★{totalStars}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleMuted}
              className="p-3 bg-[#001219] hover:bg-[#001c29] border border-[#0a9396] rounded-xl transition-all cursor-pointer text-slate-300"
              title="Toggle Sound Effects"
              id="global-audio-btn"
            >
              {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#52b788] animate-pulse" />}
            </button>

            <div className="bg-[#001219] border border-[#0a9396] px-4 py-2 rounded-lg text-left leading-none shadow-lg">
              <span className="text-[10px] text-[#94d2bd] block mb-1 uppercase tracking-wider font-semibold">Total Progress</span>
              <span className="text-xl font-mono font-bold text-white">{totalScore} <span className="text-xs opacity-60">PTS</span></span>
            </div>

            <div className="bg-[#001219] border border-[#ae2012] px-4 py-2 rounded-lg text-left leading-none shadow-lg hidden sm:block">
              <span className="text-[10px] text-[#ae2012] block mb-1 uppercase tracking-wider font-semibold">Danger Level</span>
              <span className="text-lg font-mono font-black italic text-[#ee9b00]">CRITICAL</span>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Routing */}
        {screen === 'menu' && (
          <div className="flex-1 flex flex-col justify-between py-6 relative" id="main-dashboard-menu">
            
            {/* Ambient Waterbeams and Silhouettes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <span className="absolute text-5xl left-[5%] top-[15%] animate-swim">🐬</span>
              <span className="absolute text-6xl right-[10%] top-[40%] animate-swim" style={{ animationDelay: '2s' }}>🐢</span>
              <span className="absolute text-7xl left-[12%] bottom-[15%] opacity-40 animate-pulse">🐙</span>
              <span className="absolute text-5xl right-[8%] bottom-[20%] animate-bubble-slow">🐡</span>
            </div>

            {/* Title Block & wooden plank banner */}
            <div className="text-center my-4 animate-swim" style={{ animationDuration: '6s' }}>
              
              {/* Outer Top Control Panel from uploaded image */}
              <div className="flex justify-between items-center px-4 max-w-4xl mx-auto mb-6">
                
                {/* Settings Cogwheel Button */}
                <button
                  type="button"
                  onClick={() => { audio.playClick(); setIsSettingsOpen(true); }}
                  className="w-12 h-12 bg-[#001d3d] hover:bg-cyan-900 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all transform hover:scale-110 active:scale-95 cursor-pointer group"
                  title="Open Settings Menu"
                  id="settings-cog-toggle"
                >
                  <Settings className="w-6 h-6 text-cyan-300 group-hover:rotate-45 transition-transform duration-300" />
                </button>

                {/* Center Submarine floating graphic */}
                <div className="hidden sm:flex items-center gap-2 bg-[#001219]/60 border border-cyan-500/20 px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold text-cyan-300 animate-pulse">
                  <span>🚀</span> CAMP DEEP ACTIVE
                </div>

                {/* Trophy Leaders Hall Button */}
                <button
                  type="button"
                  onClick={() => { audio.playClick(); setIsLeaderboardOpen(true); }}
                  className="w-12 h-12 bg-[#1a0f00] hover:bg-amber-900 border-2 border-amber-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all transform hover:scale-110 active:scale-95 cursor-pointer group"
                  title="Open Leaderboard"
                  id="leaderboard-shield-toggle"
                >
                  <Trophy className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Glowing Large Bubbly Title matching design */}
              <h1 className="text-5xl sm:text-7xl font-sans font-black tracking-wider text-[#8ecae6] drop-shadow-[0_4px_12px_rgba(10,147,150,0.4)] leading-none italic uppercase flex flex-col sm:flex-row items-center justify-center gap-x-4 select-none">
                <span className="text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">OCEAN</span> 
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">DEEP GO</span>
              </h1>

              {/* Wooden Plank Slogan Badge */}
              <div className="border-4 border-amber-900 bg-gradient-to-b from-amber-800 to-amber-950 px-5 py-2.5 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 text-xs uppercase font-extrabold text-amber-100 mt-4 tracking-wider select-none w-max mx-auto border-t-amber-700">
                <Compass className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '10s' }} />
                <span>Adventure of Four Kids From</span>
                <span className="bg-amber-100 text-[#001d3d] px-2.5 py-0.5 rounded-md font-mono font-black italic shadow-inner tracking-widest text-[11px]">FALCONS</span>
                <span>🚀</span>
              </div>
            </div>

            {/* Kids Cards Grid (Tani, Noam, Elyas, Dheer) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 px-4 my-6">
              
              {/* Card 1: TANI (Memory) */}
              <div 
                onClick={() => handleSelectLevel('level1', isLvl1Unlocked)}
                className="col-span-1 bg-gradient-to-b from-[#1e1b4b]/80 to-slate-950 border-2 border-purple-500 rounded-3xl p-5 flex flex-col justify-between items-center cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:scale-[1.03] active:scale-95 text-center group"
                id="cover-kid-card-1"
              >
                <div className="w-full animate-swim" style={{ animationDelay: '0ms' }}>
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className="bg-purple-900/40 border border-purple-500/30 text-purple-300 px-2 py-0.5 text-[9px] font-bold rounded">LEVEL 1</span>
                    {renderCardStars('level1')}
                  </div>
                  
                  {/* Portrait of Tani */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 border-2 border-purple-300 mx-auto my-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                    <span className="text-5xl select-none">👩🏽‍🔧</span>
                    <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />
                    {/* Water bubble float inside portrait */}
                    <div className="absolute w-2 h-2 rounded-full bg-white/30 top-3 left-6 animate-pulse" />
                  </div>

                  {/* Character Name Capsule */}
                  <div className="bg-purple-650 text-white font-black px-4 py-1 rounded-xl text-xs tracking-wider uppercase inline-block shadow-lg border border-purple-400">
                    TANI
                  </div>

                  <p className="text-xs text-[#8ecae6] leading-normal mt-3 opacity-90 font-sans">
                    Meet the fish! Tani the marine biologist maps bioluminescent sea creatures.
                  </p>
                </div>

                <button 
                  type="button"
                  className="w-full mt-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-750 border border-purple-400 text-white text-[10px] tracking-wider font-extrabold rounded-xl uppercase shadow-md pointer-events-none"
                >
                  LEVEL 1
                </button>
              </div>

              {/* Card 2: NOAM (Board Game) */}
              <div 
                onClick={() => handleSelectLevel('level2', isLvl2Unlocked)}
                className={`col-span-1 border-2 rounded-3xl p-5 flex flex-col justify-between items-center transition-all duration-300 text-center relative group ${
                  isLvl2Unlocked 
                    ? 'bg-gradient-to-b from-[#0c4a6e]/80 to-slate-950 border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:scale-[1.03] active:scale-95 cursor-pointer' 
                    : 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed filter grayscale'
                }`}
                id="cover-kid-card-2"
              >
                <div className="w-full animate-swim" style={{ animationDelay: '100ms' }}>
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-0.5 ${isLvl2Unlocked ? 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-300' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
                      LEVEL 2 {!isLvl2Unlocked && <Lock className="w-2.5 h-2.5 text-red-500 inline" />}
                    </span>
                    {isLvl2Unlocked && renderCardStars('level2')}
                  </div>
                  
                  {/* Portrait of Noam */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr border-2 mx-auto my-4 flex items-center justify-center relative overflow-hidden transition-transform ${
                    isLvl2Unlocked ? 'from-cyan-500 to-blue-600 border-cyan-300 group-hover:scale-105' : 'from-slate-850 to-slate-900 border-slate-700'
                  }`}>
                    <span className="text-5xl select-none">{isLvl2Unlocked ? '👦🏻' : '🔑'}</span>
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-cyan-950/60 text-cyan-200 text-[8px] font-bold font-mono">BRACES UNLOCKED</div>
                  </div>

                  {/* Character Name Capsule */}
                  <div className={`font-black px-4 py-1 rounded-xl text-xs tracking-wider uppercase inline-block shadow-lg border ${
                    isLvl2Unlocked ? 'bg-cyan-600 text-white border-cyan-450' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    NOAM
                  </div>

                  <p className={`text-xs mt-3 leading-normal font-sans ${isLvl2Unlocked ? 'text-[#8ecae6] opacity-90' : 'text-slate-500'}`}>
                    {isLvl2Unlocked 
                      ? 'Turtle Adventure Race! Guide our tactical sea turtle squad to victory.'
                      : 'Lock: Clear Level 1 Tani stage to launch Noam\'s race challenge!'
                    }
                  </p>
                </div>

                <button 
                  type="button"
                  className={`w-full mt-4 py-2 text-[10px] tracking-wider font-extrabold rounded-xl uppercase shadow-md pointer-events-none ${
                    isLvl2Unlocked
                      ? 'bg-gradient-to-r from-cyan-650 to-blue-650 border border-cyan-400 text-white'
                      : 'bg-slate-900 border border-slate-950 text-slate-600'
                  }`}
                >
                  {isLvl2Unlocked ? 'LEVEL 2' : 'LOCKED'}
                </button>
              </div>

              {/* Card 3: ELYAS (Squid) */}
              <div 
                onClick={() => handleSelectLevel('level3', isLvl3Unlocked)}
                className={`col-span-1 border-2 rounded-3xl p-5 flex flex-col justify-between items-center transition-all duration-300 text-center relative group ${
                  isLvl3Unlocked 
                    ? 'bg-gradient-to-b from-[#064e3b]/80 to-slate-950 border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.03] active:scale-95 cursor-pointer' 
                    : 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed filter grayscale'
                }`}
                id="cover-kid-card-3"
              >
                <div className="w-full animate-swim" style={{ animationDelay: '200ms' }}>
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-0.5 ${isLvl3Unlocked ? 'bg-emerald-900/40 border border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
                      LEVEL 3 {!isLvl3Unlocked && <Lock className="w-2.5 h-2.5 text-red-500 inline" />}
                    </span>
                    {isLvl3Unlocked && renderCardStars('level3')}
                  </div>
                  
                  {/* Portrait of Elyas */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr border-2 mx-auto my-4 flex items-center justify-center relative overflow-hidden transition-transform ${
                    isLvl3Unlocked ? 'from-emerald-500 to-teal-600 border-emerald-300 group-hover:scale-105' : 'from-slate-850 to-slate-900 border-slate-700'
                  }`}>
                    <span className="text-5xl select-none">{isLvl3Unlocked ? '🧑🏾‍🚀' : '🔑'}</span>
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-emerald-950/60 text-emerald-200 text-[8px] font-bold font-mono">FALCONS SUIT</div>
                  </div>

                  {/* Character Name Capsule */}
                  <div className={`font-black px-4 py-1 rounded-xl text-xs tracking-wider uppercase inline-block shadow-lg border ${
                    isLvl3Unlocked ? 'bg-emerald-600 text-white border-emerald-450' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    ELYAS
                  </div>

                  <p className={`text-xs mt-3 leading-normal font-sans ${isLvl3Unlocked ? 'text-[#8ecae6] opacity-90' : 'text-slate-500'}`}>
                    {isLvl3Unlocked 
                      ? 'Squid Attack! Rapidly deploy plasma fences to rescue pufferfish in danger.'
                      : 'Lock: Clear Level 2 Noam stage to launch Elyas\' Squid defense!'
                    }
                  </p>
                </div>

                <button 
                  type="button"
                  className={`w-full mt-4 py-2 text-[10px] tracking-wider font-extrabold rounded-xl uppercase shadow-md pointer-events-none ${
                    isLvl3Unlocked
                      ? 'bg-gradient-to-r from-emerald-650 to-teal-650 border border-emerald-400 text-white'
                      : 'bg-slate-900 border border-slate-950 text-slate-600'
                  }`}
                >
                  {isLvl3Unlocked ? 'LEVEL 3' : 'LOCKED'}
                </button>
              </div>

              {/* Card 4: DHEER (Bloop) */}
              <div 
                onClick={() => handleSelectLevel('level4', isLvl4Unlocked)}
                className={`col-span-1 border-2 rounded-3xl p-5 flex flex-col justify-between items-center transition-all duration-300 text-center relative group ${
                  isLvl4Unlocked 
                    ? 'bg-gradient-to-b from-[#7c2d12]/80 to-slate-950 border-orange-500 hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:scale-[1.03] active:scale-95 cursor-pointer' 
                    : 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed filter grayscale'
                }`}
                id="cover-kid-card-4"
              >
                <div className="w-full animate-swim" style={{ animationDelay: '300ms' }}>
                  <div className="flex justify-between items-center w-full mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-0.5 ${isLvl4Unlocked ? 'bg-orange-900/40 border border-orange-500/30 text-orange-300' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
                      LEVEL 4 {!isLvl4Unlocked && <Lock className="w-2.5 h-2.5 text-red-500 inline" />}
                    </span>
                    {isLvl4Unlocked && renderCardStars('level4')}
                  </div>
                  
                  {/* Portrait of Dheer */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-tr border-2 mx-auto my-4 flex items-center justify-center relative overflow-hidden transition-transform ${
                    isLvl4Unlocked ? 'from-orange-500 to-red-600 border-orange-350 group-hover:scale-105' : 'from-slate-850 to-slate-900 border-slate-700'
                  }`}>
                    <span className="text-5xl select-none">{isLvl4Unlocked ? '🧑🏼‍👓' : '🔐'}</span>
                    <div className="absolute inset-x-0 bottom-0 py-0.5 bg-orange-950/60 text-orange-200 text-[8px] font-bold font-mono">COMMANDER</div>
                  </div>

                  {/* Character Name Capsule */}
                  <div className={`font-black px-4 py-1 rounded-xl text-xs tracking-wider uppercase inline-block shadow-lg border ${
                    isLvl4Unlocked ? 'bg-orange-600 text-white border-orange-450' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    DHEER
                  </div>

                  <p className={`text-xs mt-3 leading-normal font-sans ${isLvl4Unlocked ? 'text-[#8ecae6] opacity-90' : 'text-slate-500'}`}>
                    {isLvl4Unlocked 
                      ? 'Survive Deep Bomb! Steer the sub in radioactive core bypass.'
                      : 'Lock: Clear Level 3 Elyas stage to unlock commander Dheer\'s sub!'
                    }
                  </p>
                </div>

                <button 
                  type="button"
                  className={`w-full mt-4 py-2 text-[10px] tracking-wider font-extrabold rounded-xl uppercase shadow-md pointer-events-none ${
                    isLvl4Unlocked
                      ? 'bg-gradient-to-r from-orange-650 to-red-650 border border-orange-400 text-white'
                      : 'bg-slate-900 border border-slate-950 text-slate-600'
                  }`}
                >
                  {isLvl4Unlocked ? 'LEVEL 4' : 'LOCKED'}
                </button>
              </div>

            </div>

            {/* Huge Centered Gold PLAY Button */}
            <div className="text-center my-6 relative">
              <button
                type="button"
                onClick={() => {
                  // Figure out highest unlocked level to run
                  audio.playSuccess();
                  if (isLvl4Unlocked) setScreen('level4');
                  else if (isLvl3Unlocked) setScreen('level3');
                  else if (isLvl2Unlocked) setScreen('level2');
                  else setScreen('level1');
                }}
                className="px-16 py-5 bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 hover:from-yellow-250 hover:to-orange-400 text-slate-950 text-3xl font-black rounded-full shadow-[0_0_40px_rgba(245,158,11,0.5),inset_0_4px_4px_rgba(255,255,255,0.25)] border-4 border-yellow-200 transition-all hover:scale-110 active:scale-95 duration-200 cursor-pointer select-none uppercase italic tracking-wider animate-pulse font-sans"
                id="grand-landing-play-btn"
              >
                PLAY
              </button>
              {/* Star sparkles next to play button */}
              <div className="absolute top-1/2 left-[58%] -translate-y-1/2 pointer-events-none hidden sm:block">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
              </div>
            </div>

            {/* Lower row buttons: Gallery on left, Shop Upgrade on right */}
            <div className="flex justify-between items-center px-4 max-w-4xl mx-auto mt-4 w-full">
              
              {/* GALLERY button */}
              <button
                onClick={() => { audio.playClick(); setIsGalleryOpen(true); }}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#001219] hover:bg-[#002d3d] border-2 border-[#0a9396] hover:border-[#94d2bd] font-extrabold rounded-2xl transition-all cursor-pointer text-[#94d2bd] hover:text-white shadow-[0_0_15px_rgba(10,147,150,0.2)] group/gallery scale-100 hover:scale-105 active:scale-95 text-xs text-left"
                id="landing-gallery-btn"
              >
                <Camera className="w-5 h-5 text-[#94d2bd] group-hover/gallery:rotate-12 transition-transform" />
                <div className="flex flex-col">
                  <span className="uppercase tracking-widest text-[10px] leading-none mb-0.5">Falcons</span>
                  <span className="text-[11px] leading-none text-slate-200">GALLERY</span>
                </div>
              </button>

              {/* SHOP upgrade button */}
              <button
                onClick={() => { audio.playClick(); setIsShopOpen(true); }}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#0a2336] hover:bg-[#0f344e] border-2 border-[#66fcf1] hover:border-white font-extrabold rounded-2xl transition-all cursor-pointer text-[#66fcf1] hover:text-white shadow-[0_0_15px_rgba(102,252,241,0.25)] group/shop scale-100 hover:scale-105 active:scale-95 text-xs text-left"
                id="landing-shop-btn"
              >
                <ShoppingCart className="w-5 h-5 text-[#66fcf1] group-hover/shop:animate-pulse" />
                <div className="flex flex-col">
                  <span className="uppercase tracking-widest text-[10px] leading-none mb-0.5">Upgrade</span>
                  <span className="text-[11px] leading-none text-slate-250">SUB SHOP</span>
                </div>
              </button>

            </div>

          </div>
        )}

        {screen === 'level1' && (
          <Level1Memory 
            onComplete={handleLevel1Completed}
            onPrev={handlePrevLevel}
            onNext={handleNextLevel}
          />
        )}

        {screen === 'level2' && (
          <Level2BoardGame 
            onComplete={handleLevel2Completed}
            onPrev={handlePrevLevel}
            onNext={handleNextLevel}
          />
        )}

        {screen === 'level3' && (
          <Level3Squid 
            onComplete={handleLevel3Completed}
            onPrev={handlePrevLevel}
            onNext={handleNextLevel}
          />
        )}

        {screen === 'level4' && (
          <Level4Bloop 
            onComplete={handleLevel4Completed}
            onPrev={handlePrevLevel}
            onNext={handleNextLevel}
          />
        )}

        {/* Global Campaign Success screen */}
        {screen === 'campaign_victory' && (
          <div className="flex-1 flex flex-col justify-center items-center py-10 z-10 text-center max-w-xl mx-auto" id="campaign-grand-victory-page">
            <div className="p-5 bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-2 border-amber-300 rounded-full mb-4 animate-bounce">
              <Trophy className="w-16 h-16 animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 uppercase tracking-widest font-sans">
              OCEAN DEEP GRAND CHAMPION!
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mt-3">
              Spectacular! You have completed all four stages of Tani, Noam, Elyas, and Dheer with ultimate bravery. The ocean stands synchronized, peaceful, and fully recorded in your hall of fame!
            </p>

            <div className="my-8 p-6 bg-slate-900 border border-yellow-500/20 rounded-2xl w-full min-w-[280px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">TOTAL GRAND SCORE REGISTERED</span>
              <span className="text-5xl font-black text-yellow-400 block font-mono mt-1.5">{totalScore} Points</span>
              <div className="flex gap-2.5 justify-center mt-3 text-lg">
                <span>🏆</span> <span>🎖️</span> <span>🏅</span> <span>⭐</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => { audio.playClick(); setScreen('menu'); }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl transition-all active:scale-95 text-xs"
                id="back-lobby-btn"
              >
                Back to Lobby Menu
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playSuccess();
                  setTotalScore(0);
                  setTrophies({
                    level1: false,
                    level2: false,
                    level3: false,
                    level4: false
                  });
                  setLevelScores({
                    level1: 0,
                    level2: 0,
                    level3: 0,
                    level4: 0
                  });
                  localStorage.removeItem('ocean_deep_go_score');
                  localStorage.removeItem('ocean_deep_go_trophies');
                  localStorage.removeItem('ocean_deep_go_level_scores');
                  setScreen('level1');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-xl shadow-lg border border-cyan-300 text-xs uppercase active:scale-95"
                id="reset-restart-campaign-btn"
              >
                New Campaign Journey
              </button>
            </div>
          </div>
        )}

        {/* Global Footer info details */}
        <footer className="mt-8 pt-4 border-t border-indigo-950/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3 w-full">
          <span>Google AI Studio Applet — Ocean Deep Go</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Made with React, Tailwind & WebAudio Synthesizers</span>
          </div>
        </footer>

      </div>

      {/* Interactive System Codex & Walkthrough Guide (User goals, character profiles, unlocking mechanics) */}
      <CodexAndGuide 
        isOpen={isCodexOpen} 
        onClose={() => setIsCodexOpen(false)} 
        starsCount={totalStars} 
      />

      {/* Auxiliary Overlay Modals: Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-[#001d3d] to-[#000814] border-2 border-cyan-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(10,147,150,0.3)] text-center relative">
            <button 
              onClick={() => { audio.playClick(); setIsSettingsOpen(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              ✕
            </button>
            <div className="p-3 bg-cyan-950/50 text-cyan-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-cyan-500 mb-4 animate-bounce">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-wide">EXPEDITION SETTINGS</h3>
            <p className="text-xs text-[#8ecae6] mt-1">Configure your Deep Sea Falcons controller</p>
            
            <div className="space-y-4 my-6">
              {/* Toggle Sound */}
              <div className="flex justify-between items-center bg-[#001219] p-4 rounded-xl border border-[#0a9396]/40 text-left">
                <div>
                  <span className="font-bold text-slate-200 block text-sm">Adventure Atmosphere Sounds</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Continuous extreme synthesized beats</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const isNowMuted = !audio.toggle();
                    setMuted(isNowMuted);
                    audio.playClick();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    !muted 
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {!muted ? 'Music Active' : 'Sound Muted'}
                </button>
              </div>

              {/* Wipe Progress */}
              <div className="flex justify-between items-center bg-[#001219] p-4 rounded-xl border border-red-900/40 text-left">
                <div>
                  <span className="font-bold text-red-400 block text-sm font-sans">Reset Campaign Data</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Wipe scores, badges and sub skins</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audio.playSuccess();
                    setTotalScore(0);
                    setTrophies({
                      level1: false,
                      level2: false,
                      level3: false,
                      level4: false
                    });
                    setLevelScores({
                      level1: 0,
                      level2: 0,
                      level3: 0,
                      level4: 0
                    });
                    localStorage.removeItem('ocean_deep_go_score');
                    localStorage.removeItem('ocean_deep_go_trophies');
                    localStorage.removeItem('ocean_deep_go_level_scores');
                    localStorage.removeItem('ocean_deep_go_unlocked_hulls');
                    localStorage.removeItem('ocean_deep_go_sub_color');
                    setIsSettingsOpen(false);
                    alert("✅ Expedition data successfully reset to raw recruit!");
                  }}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900/35 border border-red-500/40 text-red-200 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setIsSettingsOpen(false); }}
              className="w-full py-3 bg-[#0a9396] hover:bg-[#94d2bd] hover:shadow-lg text-[#001219] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Return to Expedition
            </button>
          </div>
        </div>
      )}

      {/* Auxiliary Overlay Modals: Trophies / Leaders */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#1a0f00] to-[#000814] border-2 border-amber-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center relative">
            <button 
              onClick={() => { audio.playClick(); setIsLeaderboardOpen(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              ✕
            </button>
            <div className="p-3 bg-amber-950/50 text-amber-400 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-amber-500 mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-black text-amber-400 uppercase italic tracking-wide">FALCONS LEADERS HALL</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">Honorable badges and deep dive statistics</p>

            <div className="my-6 space-y-3.5 text-left">
              {/* Total stats pill */}
              <div className="bg-[#1a0f00]/50 border border-amber-500/20 p-4 rounded-2xl flex justify-around text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Mission Score</span>
                  <span className="text-2xl font-black font-mono text-amber-400">{totalScore} PTS</span>
                </div>
                <div className="w-px bg-amber-500/10 h-10" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Stars Collected</span>
                  <span className="text-2xl font-black font-mono text-yellow-300">★ {totalStars} / 12</span>
                </div>
                <div className="w-px bg-amber-500/10 h-10" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Ranks Earned</span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    {Object.values(trophies).filter(Boolean).length} / 4
                  </span>
                </div>
              </div>

              {/* Level Stats breakdown */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-purple-500/20">
                  <span className="font-bold text-purple-400 text-xs flex items-center gap-1">👩🏽‍🔧 Tani's Fish Memory Badge</span>
                  <span className="text-xs font-bold font-mono text-[#ca8a04]">{levelScores.level1 || 0} PTS</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-cyan-500/30">
                  <span className="font-bold text-cyan-400 text-xs flex items-center gap-1">👦🏻 Noam's Turtle Race Shield</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">{levelScores.level2 || 0} PTS</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-emerald-500/30">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">🧑🏾‍🚀 Elyas' Squid Defense Star</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">{levelScores.level3 || 0} PTS</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-xl border border-orange-500/30">
                  <span className="font-bold text-orange-400 text-xs flex items-center gap-1">🧑🏼‍👓 Dheer's Bloop Survivor badge</span>
                  <span className="text-xs font-bold font-mono text-orange-400">{levelScores.level4 || 0} PTS</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setIsLeaderboardOpen(false); }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Close Leaders Hall
            </button>
          </div>
        </div>
      )}

      {/* Auxiliary Overlay Modals: Gallery */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-fade-in hover:cursor-default">
          <div className="w-full max-w-3xl bg-[#001d3d] border-2 border-[#005f73] rounded-3xl p-6 shadow-[0_0_60px_rgba(10,147,150,0.4)] text-center relative my-8">
            <button 
              onClick={() => { audio.playClick(); setIsGalleryOpen(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950/80 rounded-full transition-all text-sm w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            
            <div className="inline-flex p-3 bg-[#001219] text-[#94d2bd] rounded-2xl border border-[#0a9396] mb-3">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-wide leading-none">FALCONS BIOLOGICAL DISCOVERY ARCHIVES</h3>
            <p className="text-xs text-[#8ecae6] mt-1 mb-6">Historical records of the four friends' subaquatic voyage</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-h-[420px] overflow-y-auto pr-2">
              {/* Memory game photo */}
              <div className="bg-slate-950/70 border border-purple-500/20 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-wider bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded font-black font-mono">Memory Snapshot</span>
                    <span className="text-amber-400 font-bold block">★ Tani</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 uppercase">Finding Bioluminescents</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-sans">
                    Tani mapped five ancient glowing fish species, discovering that bioluminescent pulses contain deep subaquatic data patterns. They are friendly but easily shocked by camera flashes!
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] text-purple-400 font-mono border-t border-purple-500/10 pt-2">
                  <span>Coordinates: 350m Deep</span>
                  <span>Recorded 100%</span>
                </div>
              </div>

              {/* Board game photo */}
              <div className="bg-slate-950/70 border border-cyan-500/20 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-wider bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded font-black font-mono">Derby Snapshot</span>
                    <span className="text-amber-400 font-bold block">★ Noam</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 uppercase">Coral Derby Cup</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-sans">
                    Noam led four glorious sea turtles on an epic strategy duel across coral canyons. Racing past dangerous magnetic vortexes and underwater wind boosts, they proved speed is a matter of tactic!
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] text-cyan-400 font-mono border-t border-cyan-500/10 pt-2">
                  <span>Coordinates: Reef Shelf</span>
                  <span>Recorded 100%</span>
                </div>
              </div>

              {/* Squid snapshot */}
              <div className="bg-slate-950/70 border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded font-black font-mono">Arcade Blitz</span>
                    <span className="text-amber-400 font-bold block">★ Elyas</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 uppercase">Colossal Squid Siege</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-sans">
                    A giant hungry ravenous squid stalked the school of baby pufferfish. Elyas designed local defensive plasma fields, sending rapid electromagnetic counter-vibrations to rescue the nursery.
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] text-emerald-400 font-mono border-t border-emerald-500/10 pt-2">
                  <span>Coordinates: 800m Trench</span>
                  <span>Recorded 100%</span>
                </div>
              </div>

              {/* Bloop snapshot */}
              <div className="bg-slate-950/70 border border-orange-500/20 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-wider bg-orange-900/50 text-orange-300 px-2 py-0.5 rounded font-black font-mono">Survival Arena</span>
                    <span className="text-amber-400 font-bold block">★ Dheer</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 uppercase">Submarine Bloop Shield</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-sans">
                    Commander Dheer steered his customized titanium ship into the radioactive abyss to investigate the awakening of "The Bloop" creature, navigating falling hot asteroids and titanium debris.
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] text-orange-400 font-mono border-t border-orange-500/10 pt-1">
                  <span>Coordinates: 2000m Core</span>
                  <span>Recorded 100%</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setIsGalleryOpen(false); }}
              className="w-full mt-6 py-3 bg-[#0a9396] hover:bg-[#94d2bd] hover:shadow-lg text-[#001219] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Close Discovery Archives
            </button>
          </div>
        </div>
      )}

      {/* Auxiliary Overlay Modals: Upgrades Sub Shop */}
      {isShopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md hover:cursor-default animate-fade-in">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#0b0c10] to-[#1f2833] border-2 border-[#66fcf1] rounded-3xl p-6 shadow-[0_0_50px_rgba(102,252,241,0.25)] text-center relative">
            <button 
              onClick={() => { audio.playClick(); setIsShopOpen(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              ✕
            </button>
            
            <div className="p-3 bg-[#1f2833] text-[#66fcf1] rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-[#66fcf1] mb-3 animate-bounce">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-wide leading-none">FALCONS SUB UPGRADE CENTRAL</h3>
            <p className="text-xs text-cyan-350 font-semibold mt-1 mb-6">Trade your accumulated Game Score Points for extreme submarine paint skins!</p>

            {/* Wallet Balance Display */}
            <div className="bg-slate-950/80 border border-[#66fcf1]/30 p-3 rounded-2xl flex justify-between items-center mb-6">
              <span className="text-xs text-slate-400 font-mono">YOUR TOTAL AVAILABLE POINTS:</span>
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-sm font-black px-4 py-1.5 rounded-full font-mono shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                ★ {totalScore} PTS
              </span>
            </div>

            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {/* Upgrade options structure */}
              {[
                { color: '#eab308', name: 'Original Yellow Submarine Skin', id: 'yellow', cost: 0, desc: 'The iconic golden yellow hull. Equipped by default.' },
                { color: '#64748b', name: 'Titanium Steel Stealth Hull', id: 'steel', cost: 150, desc: 'Forged with deep ocean-weathered heavy titanium. Sophisticated look.' },
                { color: '#10b981', name: 'Falcons Jade Active Green Hull', id: 'jade', cost: 250, desc: 'The emerald combat team color of the Falcons Squadron.' },
                { color: '#f43f5e', name: 'Crimson Ruby Plasma Jet Hull', id: 'crimson', cost: 350, desc: 'Bioluminescent hot rose-crimson, glowing like tactical lava core.' },
                { color: '#6366f1', name: 'Midnight Kraken Amethyst Skin', id: 'amethyst', cost: 400, desc: 'Ultra-rare royal celestial blue-purple, fully blends with deep abyss.' },
              ].map((skin) => {
                const unlockedStr = localStorage.getItem('ocean_deep_go_unlocked_hulls') || '["yellow"]';
                let unlockedList = ['yellow'];
                try { unlockedList = JSON.parse(unlockedStr); } catch(err) {}

                const isUnlocked = unlockedList.includes(skin.id);
                const activeColorInStorage = localStorage.getItem('ocean_deep_go_sub_color') || '#eab308';
                const isEquipped = isUnlocked && (
                  (skin.id === 'yellow' && activeColorInStorage === '#eab308') ||
                  (skin.id === 'steel' && activeColorInStorage === '#64748b') ||
                  (skin.id === 'jade' && activeColorInStorage === '#10b981') ||
                  (skin.id === 'crimson' && activeColorInStorage === '#f43f5e') ||
                  (skin.id === 'amethyst' && activeColorInStorage === '#6366f1')
                );

                return (
                  <div key={skin.id} className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex justify-between items-center gap-3 text-left">
                    {/* Visual preview sub color mark */}
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center border border-slate-800" 
                      style={{ backgroundColor: skin.color + '15' }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-slate-950 shadow-inner" 
                        style={{ backgroundColor: skin.color }} 
                        title={skin.name}
                      />
                    </div>

                    <div className="flex-grow flex flex-col">
                      <span className="text-xs font-bold text-white uppercase tracking-tight">{skin.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">{skin.desc}</span>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-black uppercase tracking-wider block">Equipped</span>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            audio.playSuccess();
                            localStorage.setItem('ocean_deep_go_sub_color', skin.color);
                            // Force local state trigger for immediate responsive feedback
                            setIsShopOpen(false);
                            setTimeout(() => setIsShopOpen(true), 1);
                          }}
                          className="text-[10px] bg-[#66fcf1] hover:bg-white text-slate-950 font-black px-4 py-1.5 rounded-full uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (totalScore < skin.cost) {
                              audio.playDefeat();
                              alert(`❌ Not enough points! You have ★ ${totalScore} PTS but this skin costs ${skin.cost} PTS. Complete prior levels to bank points!`);
                              return;
                            }
                            
                            // Deduct points
                            const nextScore = totalScore - skin.cost;
                            setTotalScore(nextScore);
                            localStorage.setItem('ocean_deep_go_score', nextScore.toString());
                            
                            // Save unlock list
                            unlockedList.push(skin.id);
                            localStorage.setItem('ocean_deep_go_unlocked_hulls', JSON.stringify(unlockedList));
                            
                            audio.playPowerUp();
                            // Force responsive re-render trigger
                            setIsShopOpen(false);
                            setTimeout(() => setIsShopOpen(true), 1);
                          }}
                          className="text-[10px] bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 hover:scale-105 active:scale-95 transition-all cursor-pointer font-extrabold"
                        >
                          ★ Buy {skin.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { audio.playClick(); setIsShopOpen(false); }}
              className="w-full mt-6 py-3 bg-[#66fcf1] hover:bg-[#c5a3ff] hover:text-slate-950 text-slate-950 hover:shadow-lg font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Return to Expedition
            </button>
          </div>
        </div>
      )}

      {/* Interactive System Codex & Walkthrough Guide (User goals, character profiles, unlocking mechanics) */}
      <CodexAndGuide 
        isOpen={isCodexOpen} 
        onClose={() => setIsCodexOpen(false)} 
        starsCount={totalStars} 
      />
    </main>
  );
}
