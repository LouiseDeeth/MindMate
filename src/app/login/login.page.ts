import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    if (this.email === 'test@example.com' && this.password === 'password') {
      this.router.navigate(['/home']);
    } else {
      alert('Invalid credentials');
    }
  }

  goToSignup() {
    this.router.navigate(['/email-signup']);
  }

  ngOnInit() {
  }

}

export class LoginPageModule {}
