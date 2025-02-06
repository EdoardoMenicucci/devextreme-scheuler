export function formatDateUtils(dateInput: string | Date | null): string {
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

export function formatDateTimeUtils(dateInput: string | Date | null): string {
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

export function firstLetterToUpperCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
