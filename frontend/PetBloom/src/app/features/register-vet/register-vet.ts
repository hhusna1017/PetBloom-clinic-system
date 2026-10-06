import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-vet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-vet.html',
  styleUrl: './register-vet.css'
})
export class RegisterVetComponent {
  // Form Fields
  vetName: string = '';
  vetPhone: string = '';
  specialization: string = '';
  password: string = '';
  workShift: string = '';
  
  selectedDays: string[] = [];
  errorMessage: string = '';

  availableDays: string[] = ['Monday', 'Tuesday', 'Wednesday'];

  specializations: string[] = [
    'Small Animal Internal Medicine',
    'Large Animal Internal Medicine',
    'Surgery',
    'Veterinary Dentistry',
    'Dermatology',
    'Veterinary Cardiology',
    'Veterinary Oncology',
    'Veterinary Neurology',
    'Veterinary Ophthalmology',
    'Veterinary Radiology & Imaging',
    'Exotic Animal Medicine',
    'Avian Medicine & Surgery',
    'Aquatic Animal Medicine',
    'Zoo & Wildlife Medicine',
    'Veterinary Emergency & Critical Care',
    'Veterinary Anaesthesiology',
    'Veterinary Pathology',
    'Veterinary Microbiology',
    'Veterinary Nutrition',
    'Veterinary Behaviour',
    'General Practice'
  ];

  dayShiftMap: { [key: string]: string[] } = {
    'Monday': ['Morning', 'Afternoon', 'Full Day'],
    'Tuesday': ['Morning', 'Full Day'],
    'Wednesday': ['Morning', 'Afternoon', 'Full Day']
  };

  shifts = [
    { value: 'Morning', label: '🌅 Morning (8:00 AM – 1:00 PM)' },
    { value: 'Afternoon', label: '☀️ Afternoon (2:00 PM – 6:00 PM)' },
    { value: 'Full Day', label: '🌞 Full Day (8:00 AM – 6:00 PM)' }
  ];

  onDayChange(day: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }

    if (!this.isShiftAvailable(this.workShift)) {
      this.workShift = '';
    }
  }

  isShiftAvailable(shiftValue: string): boolean {
    if (this.selectedDays.length === 0) return false;

    const availableShifts = new Set<string>();
    this.selectedDays.forEach(day => {
      if (this.dayShiftMap[day]) {
        this.dayShiftMap[day].forEach(s => availableShifts.add(s));
      }
    });

    return availableShifts.has(shiftValue);
  }

  onSubmit() {
    if (this.selectedDays.length === 0) {
      this.errorMessage = 'Please select at least one working day.';
      return;
    }

    if (!this.workShift) {
      this.errorMessage = 'Please select a working shift.';
      return;
    }

    this.errorMessage = '';

    const payload = {
      vetName: this.vetName,
      vetPhone: this.vetPhone,
      specialization: this.specialization,
      workDays: this.selectedDays.join(','),
      workShift: this.workShift,
      password: this.password
    };

    console.log('Form Submitted:', payload);
    alert(`Vet Account successfully created! Welcome, Dr. ${this.vetName}.`);
  }
}