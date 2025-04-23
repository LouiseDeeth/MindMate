import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 
import { AuthService } from '../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.authService.signIn(this.email, this.password)
      .then(res => {
        console.log('✅ Logged in as:', res.user?.email);
        this.router.navigate(['/home']); 
      })
      .catch(err => {
        console.error('❌ Login error:', err.message);
      });
  }

  continueAsGuest() {
    this.authService.signInAsGuest()
      .then(res => {
        console.log('✅ Signed in as guest');
        this.router.navigate(['/home']);
      })
      .catch(err => console.error('❌ Guest login failed:', err));
  }

  continueWithGoogle() {
    this.authService.signInWithGoogle()
      .then(res => {
        console.log('✅ Logged in with Google:', res.user?.email);
        this.router.navigate(['/home']);
      })
      .catch(err => {
        console.error('❌ Google sign-in failed:', err.message);
      });
  }  

  goToSignup() {
    this.router.navigate(['/email-signup']);
  }

  ngOnInit() {
  }
}

export class LoginPageModule {}
