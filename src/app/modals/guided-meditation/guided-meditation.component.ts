import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MeditationStep {
  instruction: string;
  duration: number; // in seconds
  type: 'instruction' | 'silence' | 'breathing' | 'visualization';
}

@Component({
  selector: 'app-guided-meditation',
  templateUrl: './guided-meditation.component.html',
  styleUrls: ['./guided-meditation.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class GuidedMeditationComponent implements OnInit, OnDestroy {
  currentStep: number = 0;
  timer: number = 0;
  totalDuration: number = 0;
  isActive: boolean = false;
  isPaused: boolean = false;
  intervalId: any;
  currentInstruction: string = 'Get ready to begin your meditation';
  showSessionView: boolean = false;

  meditationPrograms = [
    {
      name: 'Anxiety Relief',
      duration: 300, // 5 minutes
      description: 'A calming meditation to reduce anxiety and stress',
      steps: [
        { instruction: 'Find a comfortable seated position and close your eyes', duration: 10, type: 'instruction' },
        { instruction: 'Take three deep breaths, releasing tension with each exhale', duration: 20, type: 'breathing' },
        { instruction: 'Notice any areas of tension in your body', duration: 15, type: 'instruction' },
        { instruction: 'Breathe into those tense areas, letting them soften', duration: 30, type: 'breathing' },
        { instruction: 'Imagine a warm, golden light surrounding you', duration: 25, type: 'visualization' },
        { instruction: 'This light represents safety and peace', duration: 20, type: 'visualization' },
        { instruction: 'Let this feeling of calm wash over you', duration: 30, type: 'silence' },
        { instruction: 'Notice your natural breath, without changing it', duration: 45, type: 'breathing' },
        { instruction: 'Each breath brings more peace and relaxation', duration: 40, type: 'breathing' },
        { instruction: 'You are safe, you are calm, you are at peace', duration: 25, type: 'instruction' },
        { instruction: 'Continue breathing naturally', duration: 30, type: 'silence' },
        { instruction: 'When you\'re ready, gently open your eyes', duration: 15, type: 'instruction' }
      ]
    },
    {
      name: 'Sleep Preparation',
      duration: 480, // 8 minutes
      description: 'A gentle meditation to prepare your mind and body for rest',
      steps: [
        { instruction: 'Lie down comfortably and close your eyes', duration: 10, type: 'instruction' },
        { instruction: 'Let your body sink into the surface beneath you', duration: 20, type: 'instruction' },
        { instruction: 'Take slow, deep breaths', duration: 30, type: 'breathing' },
        { instruction: 'Starting with your toes, consciously relax each part of your body', duration: 60, type: 'instruction' },
        { instruction: 'Feel your legs becoming heavy and relaxed', duration: 30, type: 'instruction' },
        { instruction: 'Let your arms and shoulders completely relax', duration: 30, type: 'instruction' },
        { instruction: 'Release all tension from your face and jaw', duration: 30, type: 'instruction' },
        { instruction: 'Imagine you\'re floating on a calm, peaceful lake', duration: 60, type: 'visualization' },
        { instruction: 'The gentle water supports you completely', duration: 45, type: 'visualization' },
        { instruction: 'Your breathing becomes slower and deeper', duration: 60, type: 'breathing' },
        { instruction: 'Let your mind become quiet and still', duration: 90, type: 'silence' },
        { instruction: 'You are ready for peaceful, restorative sleep', duration: 15, type: 'instruction' }
      ]
    },
    {
      name: 'Mindful Awareness',
      duration: 420, // 7 minutes
      description: 'Build present-moment awareness and mindfulness',
      steps: [
        { instruction: 'Sit with your spine straight but relaxed', duration: 10, type: 'instruction' },
        { instruction: 'Close your eyes and take three centering breaths', duration: 20, type: 'breathing' },
        { instruction: 'Begin to notice your breath without controlling it', duration: 45, type: 'breathing' },
        { instruction: 'When thoughts arise, simply notice them and return to your breath', duration: 60, type: 'instruction' },
        { instruction: 'Expand your awareness to sounds around you', duration: 45, type: 'instruction' },
        { instruction: 'Notice these sounds without judgment', duration: 30, type: 'instruction' },
        { instruction: 'Now bring attention to physical sensations in your body', duration: 60, type: 'instruction' },
        { instruction: 'Simply observe these sensations with curiosity', duration: 45, type: 'instruction' },
        { instruction: 'Return your focus to your breath', duration: 60, type: 'breathing' },
        { instruction: 'Rest in this awareness of the present moment', duration: 45, type: 'silence' },
        { instruction: 'You are practicing the art of mindful presence', duration: 20, type: 'instruction' }
      ]
    }
  ];

  selectedProgram = this.meditationPrograms[0];

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.resetSession();
  }

  ngOnDestroy() {
    this.stopMeditation();
  }

  dismiss() {
    this.stopMeditation();
    this.modalController.dismiss();
  }

  selectProgram(program: any) {
    if (this.isActive) return;
    this.selectedProgram = program;
    this.resetSession();
    this.showSessionView = true;
  }

  resetSession() {
    this.currentStep = 0;
    this.timer = this.selectedProgram.steps[0]?.duration || 0;
    this.totalDuration = this.selectedProgram.duration;
    this.currentInstruction = this.selectedProgram.steps[0]?.instruction || 'Get ready to begin';
    this.isActive = false;
    this.isPaused = false;
  }

  startMeditation() {
    if (this.isActive && !this.isPaused) return;

    if (this.isPaused) {
      this.isPaused = false;
    } else {
      this.isActive = true;
      this.currentStep = 0;
      this.timer = this.selectedProgram.steps[0].duration;
      this.currentInstruction = this.selectedProgram.steps[0].instruction;
    }

    this.intervalId = setInterval(() => {
      this.timer--;

      if (this.timer <= 0) {
        this.nextStep();
      }
    }, 1000);
  }

  pauseMeditation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isPaused = true;
    }
  }

  stopMeditation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.resetSession();
  }

  nextStep() {
    this.currentStep++;

    if (this.currentStep >= this.selectedProgram.steps.length) {
      this.completeMeditation();
      return;
    }

    const step = this.selectedProgram.steps[this.currentStep];
    this.timer = step.duration;
    this.currentInstruction = step.instruction;
  }

  completeMeditation() {
    this.stopMeditation();
    this.currentInstruction = 'Meditation complete. Take a moment to notice how you feel.';
  }

  get progress() {
    const totalSteps = this.selectedProgram.steps.length;
    const percentage = Math.round((this.currentStep / totalSteps) * 100);
    return percentage + '%';
  }

  get timeRemaining() {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get totalTimeRemaining() {
    let remaining = 0;
    for (let i = this.currentStep; i < this.selectedProgram.steps.length; i++) {
      if (i === this.currentStep) {
        remaining += this.timer;
      } else {
        remaining += this.selectedProgram.steps[i].duration;
      }
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get stepTypeIcon() {
    const currentStepData = this.selectedProgram.steps[this.currentStep];
    if (!currentStepData) return 'leaf-outline';

    switch (currentStepData.type) {
      case 'breathing': return 'fitness-outline';
      case 'visualization': return 'eye-outline';
      case 'silence': return 'moon-outline';
      default: return 'leaf-outline';
    }
  }
}