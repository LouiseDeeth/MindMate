import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-user-menu-popover',
  templateUrl: './user-menu-popover.component.html',
  styleUrls: ['./user-menu-popover.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class UserMenuPopoverComponent  implements OnInit {

  constructor(private popoverCtrl: PopoverController) {}
  @Input() userInitials: string = 'GH'; // Default

  choosePicture() {
    this.popoverCtrl.dismiss({ action: 'choose-picture' });
  }

  updateDetails() {
    this.popoverCtrl.dismiss({ action: 'update-details' });
  }

  logout() {
    this.popoverCtrl.dismiss({ action: 'logout' });
  }

  ngOnInit() {}

}
