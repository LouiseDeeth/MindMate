import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { MoodService } from '../services/mood.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-mood-tracker',
  templateUrl: './mood-tracker.page.html',
  styleUrls: ['./mood-tracker.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, UserMenuPopoverComponent],
})
export class MoodTrackerPage implements OnInit {
  userInitials = 'NA';
  isGuest = false;

  constructor(
    private authService: AuthService,
    private popoverCtrl: PopoverController,
    private router: Router,
    private moodService: MoodService,
    private firestore: Firestore
  ) { }

  selectedDate: string = new Date().toISOString();
  moods = [
    { label: 'Angry', icon: 'assets/images/angry.png' },
    { label: 'Sad', icon: 'assets/images/sad.png' },
    { label: 'Neutral', icon: 'assets/images/neutral.png' },
    { label: 'Happy', icon: 'assets/images/happy.png' },
    { label: 'Excited', icon: 'assets/images/excited.png' }
  ];
  selectedMood: number = 2;
  moodDates: { [date: string]: number } = {};

  async selectMood(index: number) {
    this.selectedMood = index;
    console.log(`Selected mood: ${this.moods[index].label} on ${this.selectedDate}`);

    // Save the mood selection if user is logged in
    if (!this.isGuest) {
      try {
        await this.moodService.saveMood(this.selectedDate, index);
        console.log('Mood saved successfully!');
      } catch (error) {
        console.error('Error saving mood:', error);
      }
    } else {
      console.log('Guest users cannot save moods');
    }
  }

  // When the date changes, load the mood for that date
  async onDateChange() {
    this.loadMoodForSelectedDate();
  }

  async loadMoodForSelectedDate() {
    if (this.isGuest) return;

    try {
      const moodIndex = await this.moodService.getMoodForDate(this.selectedDate);
      this.selectedMood = moodIndex;
      console.log('Loaded mood for date:', this.selectedDate, 'Mood:', moodIndex !== null ? this.moods[moodIndex].label : 'None');
    } catch (error) {
      console.error('Error loading mood:', error);
    }
  }

  async loadAllMoodDates() {
    if (this.isGuest) return;

    try {
      // Use your MoodService to get all moods
      const moodsData = await this.moodService.getAllMoods();
      this.moodDates = moodsData;
      console.log('Loaded all mood dates:', this.moodDates);
    } catch (error) {
      console.error('Error loading mood dates:', error);
    }
  }

  ngOnInit() {
    console.log('Checking user for Mood-Tracker page...');

    this.authService.getCurrentUser().subscribe(user => {
      console.log('Current user:', user);
      this.isGuest = !!user?.isAnonymous;
      console.log('Is guest:', this.isGuest);

      if (!this.isGuest && user) {
        // Get user initials
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          if (nameParts.length >= 2) {
            this.userInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
          } else if (nameParts.length === 1) {
            this.userInitials = nameParts[0].substring(0, 2).toUpperCase();
          }
        } else if (user.email) {
          const emailName = user.email.split('@')[0];
          this.userInitials = emailName.substring(0, 2).toUpperCase();
        }
        console.log('User initials:', this.userInitials);

        // Load mood for today
        this.loadMoodForSelectedDate();

        // Load all mood dates
        this.loadAllMoodDates();
      }
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Function to open the user menu popover
  async openUserMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: UserMenuPopoverComponent,
      event: ev,
      translucent: true,
      cssClass: 'custom-popover',
      backdropDismiss: true,
      componentProps: {
        userInitials: this.userInitials // Pass initials to popover
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data?.action === 'choose-picture') {
      // Choose a picture
      this.router.navigate(['/choose-picture']);
    } else if (data?.action === 'update-details') {
      // Navigate to the edit page
    } else if (data?.action === 'logout') {
      // Logout 
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  getHighlightedDates() {
    // Create highlighted dates for the calendar
    const highlights = [];

    for (const [dateStr, moodIndex] of Object.entries(this.moodDates)) {
      // Get the mood colour based on index
      let color;
      switch (moodIndex) {
        case 0: color = 'red'; break;      // Angry
        case 1: color = 'orange'; break;   // Sad
        case 2: color = 'yellow'; break;   // Neutral
        case 3: color = 'lightgreen'; break; // Happy
        case 4: color = 'green'; break;    // Excited
        default: color = 'blue';
      }

      highlights.push({
        date: dateStr,
        textColor: '#ffffff',
        backgroundColor: color
      });
    }

    return highlights;
  }

  getMoodHistoryEntries() {
    const entries = [];

    for (const [dateStr, moodIndex] of Object.entries(this.moodDates)) {
      entries.push({
        date: new Date(dateStr),
        moodIndex: moodIndex
      });
    }

    // Sort by date (most recent first)
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}