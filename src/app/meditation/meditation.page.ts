import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class MeditationPage implements OnInit {

  constructor() { }
  
  selectedImage: string = '';

  ngOnInit() {
    this.selectedImage = localStorage.getItem('selectedImage') || 'assets/images/Picture7.jpg';
  }
}
