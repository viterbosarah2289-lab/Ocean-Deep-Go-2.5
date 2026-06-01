/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmIntervalId: any = null;
  private bgmStep: number = 0;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startAdventureBGM() {
    if (this.bgmIntervalId) return;
    this.init();
    if (!this.ctx) return;
    
    this.bgmStep = 0;
    this.bgmIntervalId = setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        try { this.ctx.resume(); } catch(e) {}
        return;
      }
      
      const time = this.ctx.currentTime;
      // Step sequencer for Extreme Adventure Soundtrack
      // 120 bpm = 4 steps per second (250ms per step)
      const beat = this.bgmStep % 16;
      
      // 1. Deep Oceanic Adventure Bassline (sawtooth/triangle filtered)
      // Bass notes in D minor: D2 (73.4Hz), F2 (87.3Hz), G2 (98.0Hz), C2 (65.4Hz)
      let bassFreq = 73.4; // D2
      if (beat >= 4 && beat < 8) bassFreq = 87.3; // F2
      if (beat >= 8 && beat < 12) bassFreq = 98.0; // G2
      if (beat >= 12 && beat < 14) bassFreq = 65.4; // C2
      if (beat >= 14) bassFreq = 55.0; // A1
      
      // Deep suspenseful thrill pulse on even steps
      const isPulse = (beat % 2 === 0) || (beat === 3 || beat === 11);
      if (isPulse) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(bassFreq, time);
          
          // Lowpass filter to make it a deep, driving thriller pulse
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(280, time);
          
          gain.gain.setValueAtTime(0.14, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(time);
          osc.stop(time + 0.25);
        } catch (e) {}
      }
      
      // 2. High mystery adventure arpeggio on off-beats
      const arpNotes = [293.7, 349.2, 392.0, 440.0, 523.3, 440.0, 392.0, 349.2];
      const isArp = (beat % 4 === 1) || (beat === 15);
      if (isArp) {
        try {
          const oscArp = this.ctx.createOscillator();
          const gainArp = this.ctx.createGain();
          
          oscArp.type = 'triangle';
          const noteIndex = Math.floor(beat / 2) % arpNotes.length;
          oscArp.frequency.setValueAtTime(arpNotes[noteIndex], time);
          
          gainArp.gain.setValueAtTime(0.035, time);
          gainArp.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          
          oscArp.connect(gainArp);
          gainArp.connect(this.ctx.destination);
          
          oscArp.start(time);
          oscArp.stop(time + 0.45);
        } catch (e) {}
      }
      
      // 3. Ambient underwater bubbles sweep
      if (beat === 0) {
        try {
          const sweep = this.ctx.createOscillator();
          const gainSweep = this.ctx.createGain();
          sweep.type = 'sine';
          sweep.frequency.setValueAtTime(110, time);
          sweep.frequency.exponentialRampToValueAtTime(450, time + 1.2);
          
          gainSweep.gain.setValueAtTime(0.015, time);
          gainSweep.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
          
          sweep.connect(gainSweep);
          gainSweep.connect(this.ctx.destination);
          sweep.start(time);
          sweep.stop(time + 1.2);
        } catch (e) {}
      }
      
      this.bgmStep++;
    }, 250);
  }

  public stopAdventureBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public toggle(state?: boolean) {
    this.enabled = state !== undefined ? state : !this.enabled;
    if (!this.enabled) {
      this.stopAdventureBGM();
    } else {
      this.startAdventureBGM();
    }
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.2, endFreq?: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (endFreq !== undefined) {
        o.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      }

      g.gain.setValueAtTime(volume, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      o.connect(g);
      g.connect(this.ctx.destination);

      o.start();
      o.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Context tone fail', e);
    }
  }

  public playBubble() {
    // High frequency popping pluck
    this.playTone(350, 'sine', 0.15, 0.3, 1000);
  }

  public playClick() {
    this.playTone(600, 'sine', 0.08, 0.15, 120);
  }

  public playSwoosh() {
    this.playTone(150, 'sawtooth', 0.3, 0.15, 450);
  }

  public playDice() {
    let delay = 0;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(400 - i * 40, 'triangle', 0.08, 0.2);
      }, delay);
      delay += 80;
    }
  }

  public playShield() {
    this.playTone(200, 'sine', 0.4, 0.2, 800);
  }

  public playHealth() {
    this.playTone(300, 'triangle', 0.4, 0.2, 600);
  }

  public playSpeed() {
    this.playTone(400, 'sawtooth', 0.3, 0.15, 900);
  }

  public playPowerUp() {
    this.playTone(261.63, 'sine', 0.12, 0.2); // C4
    setTimeout(() => this.playTone(329.63, 'sine', 0.12, 0.2), 100); // E4
    setTimeout(() => this.playTone(392.00, 'sine', 0.12, 0.2), 200); // G4
    setTimeout(() => this.playTone(523.25, 'sine', 0.3, 0.2), 300); // C5
  }

  public playSiren() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(250, this.ctx.currentTime);
      o.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.4);
      o.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 0.8);
      o.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 1.2);
      o.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 1.6);
      
      g.gain.setValueAtTime(0.12, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.4);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);

      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + 1.8);
    } catch(e) {}
  }

  public playNuclearExplosion() {
    // Heavy detuned noise-like explosion
    this.playTone(120, 'sawtooth', 1.6, 0.4, 30);
    setTimeout(() => {
      this.playTone(80, 'triangle', 1.2, 0.5, 20);
    }, 150);
  }

  public playSuccess() {
    // Elegant major chord sequence
    const notes = [261.6, 329.6, 392.0, 523.3, 659.3];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.3, 0.25, f * 1.1);
      }, idx * 110);
    });
  }

  public playDefeat() {
    // Sad minor scale descent
    const notes = [311.1, 293.7, 261.6, 196.0];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.4, 0.25, f * 0.8);
      }, idx * 160);
    });
  }
}

export const audio = new SoundSystem();
