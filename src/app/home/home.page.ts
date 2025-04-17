import { Component } from '@angular/core';
import { UserMenuPopoverComponent } from '../components/user-menu-popover/user-menu-popover.component';
import { IonicModule, PopoverController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, UserMenuPopoverComponent, RouterLink],
})
export class HomePage {
  userInitials = 'GH'; // Placeholder for the users initials - I need to implement this later

  selectedImage: string = '';

  ngOnInit() {
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';
  }
  
  constructor(private popoverCtrl: PopoverController,
    private router: Router
  ) {}

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
