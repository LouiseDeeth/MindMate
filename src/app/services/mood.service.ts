import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private auth: Auth;
  private firestore: Firestore;

  constructor() {
    this.auth = inject(Auth);
    this.firestore = inject(Firestore);
  }
  // Save or update mood for a specific date
  async saveMood(date: string, moodIndex: number) {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    const formattedDate = this.formatDate(date);
    
    try {
      // Create a reference to the user's moods collection
      const moodsRef = collection(this.firestore, `users/${user.uid}/moods`);
      
      // Query to check if mood exists for this date
      const q = query(moodsRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new mood entry
        return await addDoc(moodsRef, {
          date: formattedDate,
          moodIndex: moodIndex,
          timestamp: new Date()
        });
      } else {
        // Update existing mood
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(this.firestore, `users/${user.uid}/moods/${docId}`);
        return await setDoc(docRef, {
          date: formattedDate,
          moodIndex: moodIndex,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      return null;
    }
  }
  
  // Get mood for a specific date
  async getMoodForDate(date: string) {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    const formattedDate = this.formatDate(date);
    
    try {
      const moodsRef = collection(this.firestore, `users/${user.uid}/moods`);
      const q = query(moodsRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const moodData = querySnapshot.docs[0].data();
        return moodData['moodIndex'];
      }
      
      return null; // No mood found for this date
    } catch (error) {
      console.error('Error getting mood:', error);
      return null;
    }
  }
  
  // Helper to format the date (YYYY-MM-DD)
  private formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  // Get all moods for the current user
  async getAllMoods() {
    const user = this.auth.currentUser;
    if (!user) return {};
    
    try {
      const moodsRef = collection(this.firestore, `users/${user.uid}/moods`);
      const querySnapshot = await getDocs(moodsRef);
      
      const moodData: { [date: string]: number } = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        moodData[data['date']] = data['moodIndex'];
      });
      
      return moodData;
    } catch (error) {
      console.error('Error getting all moods:', error);
      return {};
    }
  }
}