import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
})
export class ChatPage implements OnInit {
  messages: { role: string, content: string }[] = [
    { role: 'assistant', content: 'Hello, how can I help you today?' }
  ];
  userInput = '';

  constructor(private chatService: ChatService) { }

  @ViewChild(IonContent) content!: IonContent;

  // chat.page.ts
  sendMessage() {
    if (!this.userInput.trim()) return;

    this.messages.push({ role: 'user', content: this.userInput });
    const userMessage = this.userInput;
    this.userInput = '';

    // Add loading indicator
    this.messages.push({ role: 'assistant', content: '...' });
    const loadingIndex = this.messages.length - 1;

    this.chatService.sendMessage(userMessage).subscribe({
      next: (res) => {
        console.log('OpenAI response:', res);
        // Remove loading message
        this.messages.splice(loadingIndex, 1);

        const reply = res?.choices?.[0]?.message?.content;
        if (reply) {
          this.messages.push({
            role: 'assistant',
            content: reply
          });
        } else {
          this.messages.push({
            role: 'assistant',
            content: 'I had trouble understanding that. Could you try rephrasing?'
          });
        }

        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 100);
      },
      error: (err) => {
        console.error('Chat error:', err);
        // Remove loading message
        this.messages.splice(loadingIndex, 1);

        let errorMessage = 'Oops, something went wrong!';
        if (err.status === 401) {
          errorMessage = 'API authentication failed. Please check configuration.';
        } else if (err.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment.';
        }

        this.messages.push({
          role: 'assistant',
          content: errorMessage
        });
        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 100);
      }
    });
  }

  ngOnInit() {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      this.messages = JSON.parse(savedMessages);
    }
  }
  private saveMessages() {
    localStorage.setItem('chatHistory', JSON.stringify(this.messages));
  }
}
