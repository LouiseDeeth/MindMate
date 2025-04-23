import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent, AlertController, ModalController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { BreathingModalComponent } from '../modals/breathing-modal/breathing-modal.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class ChatPage implements OnInit, OnDestroy {
  messages: { role: string, content: string }[] = [
    { role: 'assistant', content: 'Hello, I\'m MindMate. How are you feeling today?' }
  ];
  userInput = '';
  isTyping = false;
  isProcessing = false; // Flag to prevent multiple simultaneous requests
  private authSubscription: Subscription | null = null;
  quickResponses = [
    'I feel anxious',
    'I need to calm down',
    'I feel sad today',
    'Breathing exercise'
  ];

  constructor(
    private chatService: ChatService,
    private alertController: AlertController,
    private modalController: ModalController,
    private authService: AuthService
  ) { }

  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('chatInput') chatInput!: ElementRef;

  ngOnInit() {
    // Subscribe to authentication state
    this.authSubscription = this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.loadChatHistory();
      } else {
        // Show default welcome message for non-authenticated users
        this.messages = [{
          role: 'assistant',
          content: 'Hello, I\'m MindMate. How are you feeling today?'
        }];
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }
  }

  loadChatHistory() {
    this.chatService.getChatHistory().subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          this.messages = history;
        } else {
          // If no visible messages after filtering, add welcome message
          this.messages = [{
            role: 'assistant',
            content: 'Hello, I\'m MindMate. How are you feeling today?'
          }];
        }
        this.scrollToBottom(0);
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        // Show default welcome message if error
        this.messages = [{
          role: 'assistant',
          content: 'Hello, I\'m MindMate. How are you feeling today?'
        }];
      }
    });
  }

  // Handle sending messages
  sendMessage() {
    // Prevent empty messages or sending while another request is processing
    if (!this.userInput.trim() || this.isProcessing) return;

    // Set processing flag to prevent multiple sends
    this.isProcessing = true;

    // Add user message to UI
    this.messages.push({ role: 'user', content: this.userInput });
    const userMessage = this.userInput;
    this.userInput = '';

    // Handle special commands
    if (userMessage.toLowerCase() === '/clear') {
      this.clearChat();
      this.isProcessing = false;
      return;
    }

    if (userMessage.toLowerCase() === '/breathe') {
      this.openBreathingExercise();
      this.isProcessing = false;
      return;
    }

    if (userMessage.toLowerCase() === '/help') {
      this.showHelpInfo();
      this.isProcessing = false;
      return;
    }

    // Show typing indicator
    this.isTyping = true;
    this.scrollToBottom();

    this.chatService.sendMessage(userMessage).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.isProcessing = false;

        const reply = res?.choices?.[0]?.message?.content;
        if (reply) {
          // Add the bot's response with a small delay to simulate typing
          setTimeout(() => {
            this.messages.push({
              role: 'assistant',
              content: reply
            });

            this.scrollToBottom();

            // Check for crisis keywords and offer resources if detected
            this.checkForCrisisKeywords(userMessage, reply);
          }, 500);
        } else {
          this.handleError('I had trouble understanding that. Could you try rephrasing?');
        }
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.isTyping = false;
        this.isProcessing = false;

        if (err.message === 'User not authenticated') {
          // Handle authentication errors
          this.handleError('Please log in to continue chatting.');
          return;
        }

        if (err.message === 'rate_limit_exceeded') {
          // Handle rate limit errors with a user-friendly message
          this.handleError('I\'m receiving too many messages right now. Please wait a moment before sending another message.');

          // Optional: disable the input field temporarily
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
          }, 5000); // Re-enable after 5 seconds

          return;
        }

        // More user-friendly error messages for other error types
        let errorMessage = 'I had a brief connection issue. Could you try again?';

        if (err.status === 401) {
          errorMessage = 'I\'m having trouble connecting right now. This might be a configuration issue.';
        } else if (err.status === 429) {
          errorMessage = 'I\'m processing too many requests right now. Could you wait a moment and try again?';
        } else if (err.status === 500) {
          errorMessage = 'I\'m having some technical difficulties at the moment. Please try again shortly.';
        } else if (err.status === 403) {
          errorMessage = 'I don\'t have permission to use this service right now. This might be a configuration issue.';
        }

        this.handleError(errorMessage);
      }
    });
  }

  // Use quick response
  useQuickResponse(response: string) {
    if (this.isProcessing) return; // Prevent multiple submissions

    if (response === 'Breathing exercise') {
      this.openBreathingExercise();
    } else {
      this.userInput = response;
      this.sendMessage();
    }
  }

  // Open breathing exercise modal
  async openBreathingExercise() {
    const modal = await this.modalController.create({
      component: BreathingModalComponent,
      cssClass: 'breathing-modal'
    });

    await modal.present();

    // Add message to chat history
    this.messages.push({
      role: 'assistant',
      content: 'I\'ve opened a breathing exercise for you. Remember to breathe slowly and deeply.'
    });

    this.scrollToBottom();
  }

  // Check for crisis keywords in messages
  private checkForCrisisKeywords(userMessage: string, botReply: string) {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live',
      'self harm', 'hurt myself', 'cutting myself', 'emergency', 'crisis'
    ];

    const messageText = userMessage.toLowerCase();
    const containsCrisisWord = crisisKeywords.some(word => messageText.includes(word));

    if (containsCrisisWord) {
      this.showCrisisResources();
    }
  }

  // Show crisis resources
  async showCrisisResources() {
    const resources = this.chatService.getResourcesByCountry();

    const alert = await this.alertController.create({
      header: 'Need immediate help?',
      message: `
        <p>It sounds like you might be going through a difficult time. 
        Remember, it's okay to reach out for help.</p>
        <ul>
          ${resources.map(resource => `<li>${resource}</li>`).join('')}
        </ul>
        <p>These services are available 24/7 and provide confidential support.</p>
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Show help information
  async showHelpInfo() {
    const alert = await this.alertController.create({
      header: 'MindMate Help',
      message: `
        <p><strong>Available commands:</strong></p>
        <ul>
          <li>/clear - Clear chat history</li>
          <li>/breathe - Open breathing exercise</li>
          <li>/help - Show this help message</li>
        </ul>
        <p>You can also use the quick response buttons below the chat for common needs.</p>
      `,
      buttons: ['OK']
    });

    await alert.present();

    // Add message to chat history
    this.messages.push({
      role: 'assistant',
      content: 'I\'ve shown the help information. Let me know if you have any other questions!'
    });

    this.scrollToBottom();
  }

  // Clear chat history
  async clearChat() {
    const alert = await this.alertController.create({
      header: 'Clear Chat History',
      message: 'Are you sure you want to clear your chat history?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.isProcessing = false;
          }
        },
        {
          text: 'Clear',
          handler: () => {
            this.chatService.clearHistory().subscribe({
              next: () => {
                this.messages = [{
                  role: 'assistant',
                  content: 'I\'ve cleared our conversation history. How can I help you today?'
                }];
                this.isProcessing = false;
              },
              error: (err) => {
                console.error('Error clearing chat history:', err);
                this.handleError('I had trouble clearing the chat history. Please try again.');
                this.isProcessing = false;
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // Handle error messages
  private handleError(message: string) {
    this.messages.push({
      role: 'assistant',
      content: message
    });

    this.scrollToBottom();
  }

  // Scroll to bottom of chat
  private scrollToBottom(duration = 300) {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(duration);
      }
    }, 100);
  }

  // Focus on input field
  focusInput() {
    if (this.chatInput?.nativeElement) {
      this.chatInput.nativeElement.focus();
    }
  }
}