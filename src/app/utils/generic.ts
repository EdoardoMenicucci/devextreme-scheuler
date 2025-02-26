import { inject } from '@angular/core';
import { FormatService } from '../services/format.service';

// Re-export functions from FormatService for backwards compatibility
export function formatDateUtils(dateInput: string | Date | null): string {
  return inject(FormatService).formatDate(dateInput);
}

export function formatDateTimeUtils(dateInput: string | Date | null): string {
  return inject(FormatService).formatDateTime(dateInput);
}

export function firstLetterToUpperCase(text: string): string {
  return inject(FormatService).firstLetterToUpperCase(text);
}

export function truncateText(text: string, maxLength: number = 30): string {
  return inject(FormatService).truncateText(text, maxLength);
}
