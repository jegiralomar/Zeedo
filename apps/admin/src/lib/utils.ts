/**
 * Utility functions for component class combining and formatting.
 * Standard helper following shadcn/ui patterns.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ').trim();
}

/**
 * Currency formatting helper for Iraqi Dinar.
 */
export function formatIqd(amount: number): string {
  return `${amount.toLocaleString()} د.ع`;
}

/**
 * Formats a duration in seconds to standard MM:SS or HH:MM:SS format.
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
