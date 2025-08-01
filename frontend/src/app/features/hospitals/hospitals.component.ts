import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Hospitals</h1>
      <!-- Add your hospitals content here -->
    </div>
  `,
  styles: []
})
export class HospitalsComponent {}
