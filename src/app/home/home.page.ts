import { Component, OnInit } from '@angular/core';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { IonicModule, PopoverController } from '@ionic/angular';
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
export class HomePage implements OnInit {
  isGuest = false;
  userInitials = 'GH'; // Placeholder for the users initials - I need to implement this later
  selectedImage: string = '';

  constructor(private popoverCtrl: PopoverController,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Set the homepage image
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';

    // Check if user is anonymous
    this.authService.getCurrentUser().subscribe(user => {
      this.isGuest = !!user?.isAnonymous;
    });
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
      backdropDismiss: true
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
