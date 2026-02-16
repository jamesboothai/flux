import { format, startOfWeek, addDays, addWeeks } from "date-fns";

/**
 * Get the start of the current week (Sunday)
 */
export function getCurrentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
}

/**
 * Get an array of 7 dates for a given week
 * @param offset - Week offset (0 = current week, -1 = last week, 1 = next week)
 */
export function getWeekDates(offset: number = 0): Date[] {
  const weekStart = addWeeks(getCurrentWeekStart(), offset);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Format a week range as "Jan 12 - Jan 18"
 * @param dates - Array of 7 dates for the week
 */
export function formatWeekRange(dates: Date[]): string {
  if (dates.length === 0) return "";
  const start = dates[0];
  const end = dates[6];
  const startStr = format(start, "MMM d");
  const endStr = format(end, "MMM d");
  return `${startStr} - ${endStr}`;
}

/**
 * Get day of week (0-6) for a given date
 * @param date - The date to check
 * @returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Get day name from day of week number
 * @param dayOfWeek - 0-6 (Sunday-Saturday)
 */
export function getDayName(dayOfWeek: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek] || "";
}

/**
 * Get short day name from day of week number
 * @param dayOfWeek - 0-6 (Sunday-Saturday)
 */
export function getShortDayName(dayOfWeek: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek] || "";
}

/**
 * Get today's day of week (0-6)
 */
export function getTodayDayOfWeek(): number {
  return getDayOfWeek(new Date());
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
