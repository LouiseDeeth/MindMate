// src/app/modals/relaxing-music/relaxing-music.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MusicTrack {
  name: string;
  description: string;
  duration: number; // in seconds
  type: 'nature' | 'ambient' | 'meditation' | 'sleep';
  icon: string;
}

@Component({
  selector: 'app-relaxing-music',
  templateUrl: './relaxing-music.component.html',
  styleUrls: ['./relaxing-music.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RelaxingMusicComponent implements OnInit, OnDestroy {
  isPlaying: boolean = false;
  isPaused: boolean = false;
  currentTime: number = 0;
  volume: number = 0.7;
  selectedTrack: MusicTrack | null = null;
  showTrackSelection: boolean = true;
  intervalId: any;
  audioContext: AudioContext | null = null;
  gainNode: GainNode | null = null;
  oscillators: OscillatorNode[] = [];

  musicTracks: MusicTrack[] = [
    {
      name: 'Ocean Waves',
      description: 'Gentle ocean sounds for deep relaxation',
      duration: 1800, // 30 minutes
      type: 'nature',
      icon: 'water-outline'
    },
    {
      name: 'Forest Rain',
      description: 'Soft rainfall in a peaceful forest',
      duration: 1200, // 20 minutes
      type: 'nature',
      icon: 'leaf-outline'
    },
    {
      name: 'Ambient Drones',
      description: 'Soothing ambient tones for meditation',
      duration: 1500, // 25 minutes
      type: 'ambient',
      icon: 'radio-outline'
    },
    {
      name: 'Deep Sleep',
      description: 'Low frequency tones to promote sleep',
      duration: 2700, // 45 minutes
      type: 'sleep',
      icon: 'moon-outline'
    },
    {
      name: 'Singing Bowls',
      description: 'Tibetan singing bowl meditation',
      duration: 900, // 15 minutes
      type: 'meditation',
      icon: 'musical-notes-outline'
    },
    {
      name: 'White Noise',
      description: 'Pure white noise for focus and calm',
      duration: 3600, // 60 minutes
      type: 'ambient',
      icon: 'wifi-outline'
    }
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.initializeAudioContext();
  }

  ngOnDestroy() {
    this.stopMusic();
    this.cleanupAudio();
  }

  dismiss() {
    this.stopMusic();
    this.modalController.dismiss();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume;
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  private cleanupAudio() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  selectTrack(track: MusicTrack) {
    if (this.isPlaying) {
      this.stopMusic();
    }
    this.selectedTrack = track;
    this.showTrackSelection = false;
    this.currentTime = 0;
  }

  backToSelection() {
    this.stopMusic();
    this.showTrackSelection = true;
    this.selectedTrack = null;
  }

  playMusic() {
    if (!this.selectedTrack || !this.audioContext) return;

    if (this.isPaused) {
      this.resumeMusic();
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;

    // Generate appropriate audio based on track type
    this.generateAudio(this.selectedTrack.type);

    // Start timer
    this.intervalId = setInterval(() => {
      this.currentTime++;
      if (this.currentTime >= this.selectedTrack!.duration) {
        this.stopMusic();
      }
    }, 1000);
  }

  pauseMusic() {
    if (this.audioContext) {
      this.audioContext.suspend();
    }
    this.isPaused = true;
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resumeMusic() {
    if (this.audioContext) {
      this.audioContext.resume();
    }
    this.isPaused = false;
    this.isPlaying = true;
    
    // Restart timer
    this.intervalId = setInterval(() => {
      this.currentTime++;
      if (this.currentTime >= this.selectedTrack!.duration) {
        this.stopMusic();
      }
    }, 1000);
  }

  stopMusic() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.oscillators = [];

    // Resume audio context if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  adjustVolume(event: any) {
    this.volume = event.detail.value / 100;
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  private generateAudio(type: string) {
    if (!this.audioContext || !this.gainNode) return;

    this.oscillators = [];

    switch (type) {
      case 'nature':
        this.generateNatureSounds();
        break;
      case 'ambient':
        this.generateAmbientDrones();
        break;
      case 'meditation':
        this.generateMeditationBells();
        break;
      case 'sleep':
        this.generateSleepTones();
        break;
    }
  }

  private generateNatureSounds() {
    // Generate white noise for ocean/rain sounds
    const bufferSize = this.audioContext!.sampleRate * 2;
    const noiseBuffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioContext!.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter for more natural sound
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    whiteNoise.connect(filter);
    filter.connect(this.gainNode!);
    whiteNoise.start();

    this.oscillators.push(whiteNoise as any);
  }

  private generateAmbientDrones() {
    const frequencies = [110, 146.83, 220, 293.66]; // A2, D3, A3, D4
    
    frequencies.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0.1 / frequencies.length;
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      osc.start();
      
      this.oscillators.push(osc);
    });
  }

  private generateMeditationBells() {
    // Create periodic bell sounds
    const createBell = () => {
      const osc = this.audioContext!.createOscillator();
      const oscGain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 432; // A4 tuned to 432Hz
      
      oscGain.gain.setValueAtTime(0, this.audioContext!.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.3, this.audioContext!.currentTime + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 3);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      osc.start();
      osc.stop(this.audioContext!.currentTime + 3);
    };

    // Ring bell every 8 seconds
    createBell();
    const bellInterval = setInterval(() => {
      if (this.isPlaying) {
        createBell();
      } else {
        clearInterval(bellInterval);
      }
    }, 8000);
  }

  private generateSleepTones() {
    // Low frequency binaural beats for sleep
    const baseFreq = 60; // 60Hz base tone
    const beatFreq = 2; // 2Hz difference for theta waves
    
    const osc1 = this.audioContext!.createOscillator();
    const osc2 = this.audioContext!.createOscillator();
    const gain1 = this.audioContext!.createGain();
    const gain2 = this.audioContext!.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = baseFreq;
    osc2.frequency.value = baseFreq + beatFreq;
    
    gain1.gain.value = 0.1;
    gain2.gain.value = 0.1;
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.gainNode!);
    gain2.connect(this.gainNode!);
    
    osc1.start();
    osc2.start();
    
    this.oscillators.push(osc1, osc2);
  }

  get formattedCurrentTime(): string {
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get formattedDuration(): string {
    if (!this.selectedTrack) return '0:00';
    const minutes = Math.floor(this.selectedTrack.duration / 60);
    const seconds = this.selectedTrack.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.selectedTrack) return 0;
    return (this.currentTime / this.selectedTrack.duration) * 100;
  }
}