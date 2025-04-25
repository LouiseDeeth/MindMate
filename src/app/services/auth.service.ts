import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,signInAnonymously, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth, private firestore: Firestore)  {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, async user => {
      this.currentUserSubject.next(user);
    
      if (user) {
        const userRef = doc(this.firestore, 'users', user.uid);
        await setDoc(userRef, {
          email: user.email || '',
          createdAt: new Date(),
        }, { merge: true });
      }
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

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  signInAsGuest() {
    return signInAnonymously(this.auth);
  }

  logOut() {
    return signOut(this.auth);
  }
  getUserInitials(user: any): string {
    if (user?.displayName) {
      const nameParts = user.displayName.split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
      }
    } else if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.substring(0, 2).toUpperCase();
    }
    return 'NA';
  }
}
