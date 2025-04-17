import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular'; 
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-choose-picture',
  templateUrl: './choose-picture.page.html',
  styleUrls: ['./choose-picture.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class ChoosePicturePage  implements OnInit {
  selectedImage = ''; 
  images = [
    'assets/images/Picture1.jpg',
    'assets/images/Picture2.jpg',
    'assets/images/Picture3.jpg',
    'assets/images/Picture4.jpg',
    'assets/images/Picture5.jpg',
    'assets/images/Picture6.jpg',
    'assets/images/Picture7.jpg',
    'assets/images/Picture8.jpg',
  ];

  constructor(private router: Router) {}

  selectImage(img: string) {
    this.selectedImage = img;
  }

  confirmSelection() {
    if (this.selectedImage) {
      localStorage.setItem('selectedImage', this.selectedImage);
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {}

}
