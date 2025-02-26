import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() { }

  formatDate(dateInput: string | Date | null): string {
    // format date to dd/mm/yyyy
    if (!dateInput) {
      return '';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  formatDateTime(dateInput: string | Date | null): string {
    // format date to dd/mm/yyyy hh:mm
    if (!dateInput) {
      return '';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  firstLetterToUpperCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  truncateText(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  formatUserName(username: string | null): string {
    return this.firstLetterToUpperCase(username ? username : 'User');
  }

  formatToLocalDate(date: Date, isEndDate: boolean = false): string {
    const d = new Date(date.getTime());
    if (isEndDate) {
      d.setHours(23, 59, 59);
    } else {
      d.setHours(0, 0, 0);
    }
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      'T' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0') +
      ':' +
      String(d.getSeconds()).padStart(2, '0')
    );
  }

  roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
