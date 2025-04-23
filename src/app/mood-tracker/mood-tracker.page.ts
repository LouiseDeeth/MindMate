import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';

@Component({
  selector: 'app-mood-tracker',
  templateUrl: './mood-tracker.page.html',
  styleUrls: ['./mood-tracker.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class MoodTrackerPage implements OnInit {
  userInitials = 'NA';
  isGuest = false;

  constructor(
    private authService: AuthService,
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

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
    console.log('Checking user for Mood-Tracker page...');

    this.authService.getCurrentUser().subscribe(user => {
      console.log('Current user:', user);
      this.isGuest = !!user?.isAnonymous;
      console.log('Is guest:', this.isGuest);

      if (!this.isGuest && user) {
        this.userInitials = this.authService.getUserInitials(user);
        console.log('User initials:', this.userInitials);
      }
    });
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
}
