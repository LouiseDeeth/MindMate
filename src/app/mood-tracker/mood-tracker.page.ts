import { Component, OnInit, NgZone, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { MoodService } from '../services/mood.service';

@Component({
  selector: 'app-mood-tracker',
  templateUrl: './mood-tracker.page.html',
  styleUrls: ['./mood-tracker.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, UserMenuPopoverComponent],
})
export class MoodTrackerPage implements OnInit {
  private authService = inject(AuthService);
  private popoverCtrl = inject(PopoverController);
  private router = inject(Router);
  private moodService = inject(MoodService);
  private ngZone = inject(NgZone);

  userInitials = 'NA';
  isGuest = false;

  selectedDate: string = new Date().toISOString().split('T')[0];

  moods = [
    { label: 'Angry', icon: 'assets/images/angry.png' },
    { label: 'Sad', icon: 'assets/images/sad.png' },
    { label: 'Neutral', icon: 'assets/images/neutral.png' },
    { label: 'Happy', icon: 'assets/images/happy.png' },
    { label: 'Excited', icon: 'assets/images/excited.png' }
  ];

  selectedMood: number | null = null;
  moodDates: { [date: string]: number } = {};
  highlightedDates: any[] = [];
  isLoading = false;

  constructor() {}

  async selectMood(index: number) {
    this.selectedMood = index;
    const formattedDate = this.formatDate(this.selectedDate);

    if (!this.isGuest) {
      this.isLoading = true;

      try {
        await this.moodService.saveMood(this.selectedDate, index);
        this.ngZone.run(() => {
          console.log(`Mood saved successfully!`);
          this.moodDates[formattedDate] = index;
          this.updateHighlightedDates();
        });
      } catch (err) {
        console.error('Error saving mood:', err);
      } finally {
        this.isLoading = false;
      }
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  async onDateChange(event: any) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const newDate = event?.detail?.value || this.selectedDate;
      console.log('Date changed to:', newDate);

      this.ngZone.run(async () => {
        this.selectedDate = newDate;
        await this.loadMoodForSelectedDate();
      });
    } catch (error) {
      console.error('Error in date change:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoodForSelectedDate() {
    const formattedDate = this.formatDate(this.selectedDate);
    console.log('Looking for mood on date:', formattedDate);

    try {
      const mood = await this.moodService.getMoodForDate(this.selectedDate);

      this.ngZone.run(() => {
        if (mood !== null) {
          console.log(`Loaded mood for date: ${formattedDate} Mood: ${mood}`);
          this.selectedMood = mood;
        } else {
          console.log(`No mood found for date: ${formattedDate}`);
          this.selectedMood = null;
        }
      });
    } catch (err) {
      console.error('Failed to load mood:', err);
    }
  }

  async loadAllMoodDates() {
    if (this.isGuest) return;

    try {
      const moodsData = await this.moodService.getAllMoods();

      this.ngZone.run(() => {
        this.moodDates = moodsData;
        console.log('Loaded all mood dates:', this.moodDates);
        this.updateHighlightedDates();
      });
    } catch (error) {
      console.error('Error loading mood dates:', error);
    }
  }

  updateHighlightedDates() {
    this.highlightedDates = [];

    for (const [dateStr, moodIndex] of Object.entries(this.moodDates)) {
      let color;
      switch (moodIndex) {
        case 0: color = 'red'; break;
        case 1: color = 'orange'; break;
        case 2: color = 'yellow'; break;
        case 3: color = 'lightgreen'; break;
        case 4: color = 'green'; break;
        default: color = 'blue';
      }

      this.highlightedDates.push({
        date: dateStr,
        textColor: '#ffffff',
        backgroundColor: color
      });
    }

    console.log('Updated highlighted dates');
  }

  ngOnInit() {
    console.log('Initializing Mood-Tracker page...');

    this.authService.getCurrentUser().subscribe(user => {
      console.log('Current user:', user);
      this.isGuest = !!user?.isAnonymous;
      console.log('Is guest:', this.isGuest);

      if (!this.isGuest && user) {
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

        this.selectedDate = new Date().toISOString().split('T')[0];
      }
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  async openUserMenu(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: UserMenuPopoverComponent,
      event: ev,
      translucent: true,
      cssClass: 'custom-popover',
      backdropDismiss: true,
      componentProps: {
        userInitials: this.userInitials
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data?.action === 'choose-picture') {
      this.router.navigate(['/choose-picture']);
    } else if (data?.action === 'logout') {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }
}
