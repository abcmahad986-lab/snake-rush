// Audio Manager for Snake Rush
// Uses Web Audio API for synthesized sound effects

class AudioManager {
  private audioContext: AudioContext | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem('snake-audio-muted');
    this.isMuted = savedMuteState === 'true';
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Synthesize a beep/crunch sound for eating food
  playEatSound() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Quick ascending beep
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  // Synthesize a crash/game over sound
  playGameOverSound() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Descending crash sound
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  // Synthesize a UI click sound
  playClickSound() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Short click
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  // Synthesize a success/reward sound
  playSuccessSound() {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Ascending success chime
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  // Start background music (simple loop)
  startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;

    const ctx = this.getContext();
    
    // Create a simple melody using oscillators
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.05, ctx.currentTime); // Very quiet background
    this.bgmGain.connect(ctx.destination);

    // Simple ascending/descending pattern
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.connect(noteGain);
      noteGain.connect(this.bgmGain!);
      
      osc.frequency.setValueAtTime(freq, startTime);
      osc.type = 'sine';
      
      noteGain.gain.setValueAtTime(0.1, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Play a simple melody loop
    const melody = [
      { freq: 261.63, time: 0, dur: 0.2 },    // C4
      { freq: 293.66, time: 0.2, dur: 0.2 },  // D4
      { freq: 329.63, time: 0.4, dur: 0.2 },  // E4
      { freq: 349.23, time: 0.6, dur: 0.2 },  // F4
      { freq: 392.00, time: 0.8, dur: 0.4 },  // G4
      { freq: 349.23, time: 1.2, dur: 0.2 },  // F4
      { freq: 329.63, time: 1.4, dur: 0.2 },  // E4
      { freq: 293.66, time: 1.6, dur: 0.4 },  // D4
    ];

    const loopDuration = 2.0; // 2 second loop
    
    const playLoop = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      
      const now = ctx.currentTime;
      melody.forEach(note => {
        playNote(note.freq, now + note.time, note.dur);
      });
      
      // Schedule next loop
      setTimeout(playLoop, loopDuration * 1000);
    };

    this.isBgmPlaying = true;
    playLoop();
  }

  // Stop background music
  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmGain) {
      this.bgmGain.gain.exponentialRampToValueAtTime(0.01, this.getContext().currentTime + 0.1);
      setTimeout(() => {
        if (this.bgmGain) {
          this.bgmGain.disconnect();
          this.bgmGain = null;
        }
      }, 100);
    }
  }

  // Toggle mute state
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snake-audio-muted', this.isMuted.toString());
    
    if (this.isMuted) {
      this.stopBGM();
    } else {
      // BGM will restart when game starts
    }
    
    return this.isMuted;
  }

  // Check if muted
  getIsMuted(): boolean {
    return this.isMuted;
  }

  // Resume audio context (needed after user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
