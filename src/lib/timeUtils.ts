import { useState, useEffect } from 'react';
import type { TimeOfDay } from './types';

/**
 * Formats a Date object into 12-hour Kolkata time (Asia/Kolkata).
 * Example output: "9:02 PM", "12:01 AM", "11:59 PM".
 */
export function formatKolkataTime(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return formatter.format(date);
}

/**
 * Returns the hour (0-23) in Asia/Kolkata for time mapping.
 */
export function getKolkataHour(date: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(date), 10);
}

/**
 * Maps any TimeOfDay or time string to the closest fixture dataset key ('18:00' | '21:00' | '23:30').
 */
export function mapTimeToFixtureKey(timeVal: TimeOfDay): '18:00' | '21:00' | '23:30' {
  if (timeVal === '18:00') return '18:00';
  if (timeVal === '21:00') return '21:00';
  if (timeVal === '23:30') return '23:30';

  // If timeVal is 'now' or dynamic local time
  const hour = getKolkataHour();
  if (hour >= 22 || hour < 5) return '23:30';
  if (hour >= 19) return '21:00';
  return '18:00';
}

/**
 * Custom React hook that returns the live current time formatted in Asia/Kolkata.
 * Updates automatically every minute on minute boundary without creating duplicate timers.
 */
export function useCurrentTime(): string {
  const [timeStr, setTimeStr] = useState<string>(() => formatKolkataTime());

  useEffect(() => {
    // Check every second to ensure minute transition occurs immediately when clock ticks
    const interval = setInterval(() => {
      const nextStr = formatKolkataTime();
      setTimeStr((prev) => (prev !== nextStr ? nextStr : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeStr;
}
