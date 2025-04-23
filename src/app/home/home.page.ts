import { Component, OnInit } from '@angular/core';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { IonicModule, PopoverController, ViewWillEnter  } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, UserMenuPopoverComponent, RouterLink, CommonModule],
})
export class HomePage implements OnInit, ViewWillEnter  {
  isGuest = false;
  userInitials = 'NA'; // Placeholder for the users initials 
  selectedImage: string = '';

  constructor(private popoverCtrl: PopoverController,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Set the homepage image
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';
    
    // Check if user is logged in
    console.log('About to check current user');

    // Check if user is anonymous
    this.authService.getCurrentUser().subscribe(user => {
      
      // Log the user object to see if it's anonymous
      console.log('Current user:', user);
      this.isGuest = !!user?.isAnonymous;

      // Log the isGuest status
      console.log('Is guest:', this.isGuest);

      // If not a guest, generate initials
      if (!this.isGuest && user) {
        console.log('Generating initials for user');
        this.generateUserInitials(user);
        console.log('Generated initials:', this.userInitials);

      }
    });
  }

  ionViewWillEnter() {
    // Reload the image when returning to home
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';
  }

    // Function to generate the users initials 
    private generateUserInitials(user: any) {
      if (user.displayName) {
        const nameParts = user.displayName.split(' ');
        if (nameParts.length >= 2) {
          // Get first letter of first and last name
          this.userInitials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
          // If only one name, use first two letters
          this.userInitials = nameParts[0].substring(0, 2).toUpperCase();
        }
      } else if (user.email) {
        // If theres no displayed name, use the email address
        const emailName = user.email.split('@')[0];
        // Use first two characters of email name
        this.userInitials = emailName.substring(0, 2).toUpperCase();
      }
    }

  goToLogin() {
    this.router.navigate(['/login']);
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
