import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-breathing-modal',
  templateUrl: './breathing-modal.component.html',
  styleUrls: ['./breathing-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class BreathingModalComponent implements OnInit, OnDestroy {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';
  timer: number = 4;
  circleSize: number = 100;
  maxSize: number = 200;
  minSize: number = 100;
  intervalId: any;
  cycleCount: number = 0;
  totalCycles: number = 5;
  instruction: string = 'Breathe in slowly...';
  isActive: boolean = false;
  breathingPatterns = [
    { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, rest: 0 },
    { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, rest: 4 },
    { name: 'Calm Breathing', inhale: 4, hold: 2, exhale: 6, rest: 0 }
  ];
  selectedPattern = this.breathingPatterns[0];

  constructor(private modalCtrl: ModalController, private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.stopBreathing();
  }

  dismiss() {
    this.stopBreathing();
    this.modalCtrl.dismiss().then(() => {
      console.log('Breathing modal dismissed successfully');
    }).catch(error => {
      console.error('Error dismissing breathing modal:', error);
    });
  }

  startBreathing() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.cycleCount = 0;
    this.phase = 'inhale';
    this.updateInstructions();
    
    this.intervalId = setInterval(() => {
      this.timer--;
      
      if (this.timer <= 0) {
        this.nextPhase();
      }
      
      if (this.phase === 'inhale') {
        this.circleSize = this.minSize + ((this.maxSize - this.minSize) * (1 - this.timer / this.selectedPattern.inhale));
      } else if (this.phase === 'exhale') {
        this.circleSize = this.maxSize - ((this.maxSize - this.minSize) * (1 - this.timer / this.selectedPattern.exhale));
      }
    }, 1000);
  }

  stopBreathing() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isActive = false;
      this.circleSize = this.minSize;
    }
  }

  nextPhase() {
    switch (this.phase) {
      case 'inhale':
        this.phase = 'hold';
        this.timer = this.selectedPattern.hold;
        break;
      case 'hold':
        this.phase = 'exhale';
        this.timer = this.selectedPattern.exhale;
        break;
      case 'exhale':
        if (this.selectedPattern.rest > 0) {
          this.phase = 'rest';
          this.timer = this.selectedPattern.rest;
        } else {
          this.completePhase();
        }
        break;
      case 'rest':
        this.completePhase();
        break;
    }
    
    this.updateInstructions();
  }

  completePhase() {
    this.cycleCount++;
    
    if (this.cycleCount >= this.totalCycles) {
      this.stopBreathing();
      this.instruction = 'Well done! You completed the exercise.';
    } else {
      this.phase = 'inhale';
      this.timer = this.selectedPattern.inhale;
      this.updateInstructions();
    }
  }

  updateInstructions() {
    switch (this.phase) {
      case 'inhale':
        this.instruction = 'Breathe in slowly...';
        break;
      case 'hold':
        this.instruction = 'Hold your breath...';
        break;
      case 'exhale':
        this.instruction = 'Breathe out slowly...';
        break;
      case 'rest':
        this.instruction = 'Rest...';
        break;
    }
  }

  selectPattern(pattern: any) {
    this.stopBreathing();
    this.selectedPattern = pattern;
  }

  get progress() {
    return ((this.cycleCount / this.totalCycles) * 100) + '%';
  }
}