import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError, timer, from, of, Subscription } from 'rxjs';
import { catchError, retryWhen, delayWhen, take, tap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Firestore, collection, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {

  private apiKey = environment.claudeApiKey;
  private apiUrl = environment.backendUrl;
  private claudeModel = 'claude-3-opus-20240229';
  private chatHistory: { role: string, content: string }[] = [];
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // Minimum time between requests in ms
  private currentUser: User | null = null;
  private authSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadChatHistoryFromFirestore();
      } else {
        // Initialize with system message if no user or no history
        this.initializeDefaultChatHistory();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private initializeDefaultChatHistory(): void {
    this.chatHistory = [
      {
        role: 'system',
        content: this.getSystemMessage()
      }
    ];
  }

  private loadChatHistoryFromFirestore(): Promise<void> {
    if (!this.currentUser) {
      this.initializeDefaultChatHistory();
      return Promise.resolve();
    }

    const chatDocRef = doc(this.firestore, `users/${this.currentUser.uid}/data/chatHistory`);

    return getDoc(chatDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data['messages'] && Array.isArray(data['messages'])) {
          this.chatHistory = data['messages'];

          // Make sure we have the system message
          if (!this.chatHistory.some(msg => msg.role === 'system')) {
            // Add system message if it doesn't exist
            this.chatHistory.unshift({
              role: 'system',
              content: this.getSystemMessage()
            });
          }
          return Promise.resolve();
        } else {
          // Invalid data format, initialize default
          this.initializeDefaultChatHistory();
          return this.saveChatHistoryToFirestore();
        }
      } else {
        // No existing document, initialize default history
        this.initializeDefaultChatHistory();
        return this.saveChatHistoryToFirestore();
      }
      return Promise.resolve();
    }).catch(error => {
      console.error('Error loading chat history from Firestore:', error);
      this.initializeDefaultChatHistory();
      return Promise.resolve();
    });
  }

  private getSystemMessage(): string {
    return `You are MindMate, a compassionate mental health support companion designed to help users with anxiety, stress, and depression.

Guidelines for your responses:
1. Be warm, empathetic, and supportive at all times
2. Use a calm, reassuring tone that helps users feel safe and understood
3. Validate the user's feelings without judgment
4. Offer practical coping strategies and gentle encouragement
5. Ask thoughtful follow-up questions to better understand their situation
6. Incorporate mindfulness techniques and grounding exercises when appropriate
7. Recognize signs of severe distress and suggest professional help when needed
8. Keep responses concise (2-4 sentences) and easy to read
9. Use simple, clear language and avoid clinical terminology
10. Never claim to diagnose conditions or replace professional mental health care

Remember that your purpose is to provide immediate emotional support and practical coping tools. Always emphasize self-compassion and remind users that seeking help is a sign of strength.`;
  }

  private saveChatHistoryToFirestore(): Promise<void> {
    if (!this.currentUser) {
      console.warn('Cannot save chat history: No authenticated user');
      return Promise.resolve();
    }

    const chatDocRef = doc(this.firestore, `users/${this.currentUser.uid}/data/chatHistory`);

    return setDoc(chatDocRef, {
      messages: this.chatHistory,
      updatedAt: new Date()
    }, { merge: true }).catch(error => {
      console.error('Error saving chat history to Firestore:', error);
      return Promise.reject(error);
    });
  }

  sendMessage(message: string): Observable<any> {
    if (!this.apiKey) {
      return throwError(() => new Error('Claude API key is not configured'));
    }

    // Check if user is authenticated
    if (!this.currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Add rate limiting with proper delay implementation
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // If we need to delay, return an observable that waits before making the request
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delayTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Enforcing rate limit: Delaying request by ${delayTime}ms`);

      return timer(delayTime).pipe(
        switchMap(() => this.executeClaudeRequest(message))
      );
    }

    // Otherwise, proceed immediately
    return this.executeClaudeRequest(message);
  }

  // Separated the actual request execution for better rate limit control
  private executeClaudeRequest(message: string): Observable<any> {
    this.lastRequestTime = Date.now(); // Update timestamp before the request

    // Add user message to chat history
    this.chatHistory.push({ role: 'user', content: message });

    // Keep only the last 10 messages to manage token usage
    if (this.chatHistory.length > 11) { // Keep system message + last 10 exchanges
      this.chatHistory = [
        this.chatHistory[0], // Keep system message
        ...this.chatHistory.slice(-10) // Keep last 10 messages
      ];
    }

    // Extract system message and prepare Claude-compatible message format
    let systemMessage = '';
    const claudeMessages = this.chatHistory.filter(msg => {
      if (msg.role === 'system') {
        systemMessage = msg.content;
        return false;
      }
      return true;
    });

    // We're now sending to our backend proxy, not directly to Claude
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Send all Claude API details to our backend proxy
    const body = {
      apiKey: this.apiKey, // Backend will use this to authenticate with Claude
      model: this.claudeModel,
      messages: claudeMessages,
      system: systemMessage,
      max_tokens: 350,
      temperature: 0.7
    };

    // Add improved retry logic with exponential backoff for rate limit errors
    return this.http.post(this.apiUrl, body, { headers }).pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(error => {
            if (error.status === 429) {
              // Rate limit hit - increase the minimum interval for future requests
              this.minRequestInterval = Math.min(this.minRequestInterval * 2, 10000); // Double up to max 10 seconds
              console.log(`Rate limit exceeded. Increasing minimum interval to ${this.minRequestInterval}ms`);
            }
            console.log(`Request error: ${error.status}. Retrying...`);
          }),
          delayWhen(error => {
            // Use longer delays for rate limit errors
            const baseDelay = error.status === 429 ? 5000 : 2000;
            return timer(baseDelay);
          }),
          take(3) // Maximum 3 retry attempts
        )
      ),
      tap((res: any) => {
        // Update chat history with assistant's response
        if (res?.content) {
          const assistantMessage = {
            role: 'assistant',
            content: res.content
          };

          this.chatHistory.push(assistantMessage);
          this.saveChatHistoryToFirestore();

          // Reset minRequestInterval after successful request (gradually)
          if (this.minRequestInterval > 1000) {
            this.minRequestInterval = Math.max(1000, this.minRequestInterval - 1000);
          }
        }
      }),
      // Transform the response to match the expected format in the component
      switchMap((response: any) => {
        if (response?.content) {
          // Create a response object that matches what the component expects
          const formattedResponse = {
            choices: [
              {
                message: {
                  content: response.content,
                  role: 'assistant'
                }
              }
            ]
          };
          return of(formattedResponse);
        } else {
          return throwError(() => new Error('Invalid response from API'));
        }
      }),
      catchError(error => {
        console.error('Error with API:', error);

        if (error.status === 429) {
          // Special handling for rate limit errors
          return throwError(() => new Error('rate_limit_exceeded'));
        }

        // Don't modify chat history here, let the component handle it
        return throwError(() => error);
      })
    );
  }

  // Get the chat history excluding system messages
  getChatHistory(): Observable<{ role: string, content: string }[]> {
    if (!this.currentUser) {
      return of([]);
    }

    return from(this.loadChatHistoryFromFirestore()).pipe(
      switchMap(() => of(this.chatHistory.filter(msg => msg.role !== 'system')))
    );
  }

  // Method to clear chat history
  clearHistory(): Observable<void> {
    if (!this.currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Keep only the system message
    const systemMessage = this.chatHistory.find(msg => msg.role === 'system');
    this.chatHistory = systemMessage ? [systemMessage] : [{
      role: 'system',
      content: this.getSystemMessage()
    }];

    return from(this.saveChatHistoryToFirestore());
  }

  // Useful for emergency situations
  getResourcesByCountry(country: string = 'US'): string[] {
    const resources: { [key: string]: string[] } = {
      'IE': [
        'Samaritans Ireland: 116 123 (free, 24/7)',
        'Pieta House (suicide/self-harm): 1800 247 247',
        'Aware Support Line (depression, bipolar): 1800 80 48 48',
        'Childline (under 18s): 1800 66 66 66 or text 50101',
        'Women\'s Aid (domestic abuse): 1800 341 900',
        'Text About It (crisis text line): Text HELLO to 50808'
      ],
      'US': [
        'National Suicide Prevention Lifeline: 988 or 1-800-273-8255',
        'Crisis Text Line: Text HOME to 741741',
        'SAMHSA Treatment Referral Hotline: 1-877-726-4727'
      ],
      'UK': [
        'Samaritans: 116 123',
        'Mind: 0300 123 3393',
        'Shout Crisis Text Line: Text SHOUT to 85258'
      ],
      'AU': [
        'Lifeline: 13 11 14',
        'Beyond Blue: 1300 22 4636',
        'MensLine Australia: 1300 78 99 78'
      ],
      'CA': [
        'Crisis Services Canada: 1-833-456-4566',
        'Kids Help Phone: 1-800-668-6868',
        'Hope for Wellness Helpline: 1-855-242-3310'
      ]
    };

    return resources[country] || resources['IE'];
  }
}