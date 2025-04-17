import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,signInAnonymously, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, user => {
      this.currentUserSubject.next(user);
    });
  }

  getCurrentUser() {
    return this.currentUserSubject.asObservable();
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signInAsGuest() {
    return signInAnonymously(this.auth);
  }

  logOut() {
    return signOut(this.auth);
  }
}
