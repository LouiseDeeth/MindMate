import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mood-tracker',
  templateUrl: './mood-tracker.page.html',
  styleUrls: ['./mood-tracker.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class MoodTrackerPage implements OnInit {

  constructor() { }

  selectedDate: string = new Date().toISOString();

  moods = [
    { label: 'Angry', icon: 'assets/images/angry.png' },
    { label: 'Sad', icon: 'assets/images/sad.png' },
    { label: 'Neutral', icon: 'assets/images/neutral.png' },
    { label: 'Happy', icon: 'assets/images/happy.png' },
    { label: 'Excited', icon: 'assets/images/excited.png' }
  ];

  selectedMood: number = 2;

  selectMood(index: number) {
    this.selectedMood = index;
    console.log(`Selected mood: ${this.moods[index].label} on ${this.selectedDate}`);

  }
  
  ngOnInit() {
  }
}
