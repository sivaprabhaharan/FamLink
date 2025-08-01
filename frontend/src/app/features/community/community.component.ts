import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Community</h1>
      <div class="space-y-6">
        <!-- Add your community posts here -->
      </div>
    </div>
  `
})
export class CommunityComponent {}
