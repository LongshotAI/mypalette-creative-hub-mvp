
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a price with currency symbol
export function formatPrice(price: number | null, currency: string = 'USD'): string {
  if (price === null) return 'Not for sale';
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    ETH: 'Ξ'
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  return `${symbol}${price}`;
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Get initials from a name
export function getInitials(name: string | null): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Get readable date from ISO string
export function getReadableDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
