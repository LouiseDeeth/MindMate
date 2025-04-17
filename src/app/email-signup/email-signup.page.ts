import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-email-signup',
  templateUrl: './email-signup.page.html',
  styleUrls: ['./email-signup.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EmailSignupPage implements OnInit {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  photoUrl = '';

  constructor(private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Registered:', {
      name: this.name,
      email: this.email,
      phone: this.phone,
      photo: this.photoUrl
    });

    this.router.navigate(['/home']);
  }

  ngOnInit() {
  }
}
