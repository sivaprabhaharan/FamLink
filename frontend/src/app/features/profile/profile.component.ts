import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Profile</h1>
      <div class="max-w-2xl mx-auto">
        <!-- Add your profile form here -->
      </div>
    </div>
  `
})
export class ProfileComponent {}
