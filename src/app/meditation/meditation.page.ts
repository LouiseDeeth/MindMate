import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { BreathingModalComponent } from '../modals/breathing-modal/breathing-modal.component';
import { GuidedMeditationComponent } from '../modals/guided-meditation/guided-meditation.component';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    BreathingModalComponent,
    GuidedMeditationComponent
  ],
})
export class MeditationPage implements OnInit {

  isGuest = false;
  userInitials = 'NA';

  constructor(
    private authService: AuthService,
    private popoverCtrl: PopoverController,
    private router: Router,
    private modalController: ModalController
  ) { }

  selectedImage: string = '';

  ngOnInit() {
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';
    console.log('Checking user for meditation page...');

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
        userInitials: this.userInitials
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

  // Open the breathing exercise modal
  async openBreathingExercises() {
    const modal = await this.modalController.create({
      component: BreathingModalComponent,
      cssClass: 'breathing-modal'
    });

    return await modal.present();
  }
  
  // Open the guided meditation modal
  async startGuidedMeditation() {
    const modal = await this.modalController.create({
      component: GuidedMeditationComponent,
      cssClass: 'guided-meditation-modal'
    });
    
    return await modal.present();
  }

  // For the relaxing music button (placeholder for now)
  playRelaxingMusic() {
    console.log('Playing relaxing music...');
  }
}