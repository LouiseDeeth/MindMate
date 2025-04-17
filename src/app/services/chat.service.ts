import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiKey = environment.openAiApiKey;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) { }

// chat.service.ts
sendMessage(message: string): Observable<any> {
  if (!this.apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`,
    ...(environment.openAiOrgId ? {'OpenAI-Organization': environment.openAiOrgId} : {})
  });

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful mental health assistant called MindMate that helps with anxiety and stress. Be empathetic and supportive.' },
      { role: 'user', content: message }
    ],
    temperature: 0.7 // Added for better responses
  };

  return this.http.post(this.apiUrl, body, { headers });
}
}
