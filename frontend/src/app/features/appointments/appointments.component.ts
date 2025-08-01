import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Appointments</h1>
      <!-- Add your appointments content here -->
    </div>
  `,
  styles: []
})
export class AppointmentsComponent {}
