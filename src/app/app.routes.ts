import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.page').then(m => m.ChatPage)
  },
  {
    path: 'mood-tracker',
    loadComponent: () => import('./mood-tracker/mood-tracker.page').then(m => m.MoodTrackerPage)
  },
  {
    path: 'meditation',
    loadComponent: () => import('./meditation/meditation.page').then(m => m.MeditationPage)
  },
  {
    path: 'help-numbers',
    loadComponent: () => import('./help-numbers/help-numbers.page').then(m => m.HelpNumbersPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'choose-picture',
    loadComponent: () => import('./choose-picture/choose-picture.page').then(m => m.ChoosePicturePage)
  },
  {
    path: 'email-signup',
    loadComponent: () => import('./email-signup/email-signup.page').then(m => m.EmailSignupPage)
  }
 
];

