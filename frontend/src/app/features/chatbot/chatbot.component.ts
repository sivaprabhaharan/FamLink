import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Chatbot</h1>
      <!-- Add your chatbot content here -->
    </div>
  `,
  styles: []
})
export class ChatbotComponent {}
