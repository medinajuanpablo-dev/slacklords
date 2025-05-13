import { HOLIDAYS } from '@/constants/constants';
import { DateTime } from 'luxon';

export function convertLocalTimeToUTC(localTime: string, userTimezone: string): string {
  const [hours, minutes] = localTime.split(':').map(Number);
  const local = DateTime.fromObject({ hour: hours, minute: minutes }, { zone: userTimezone });
  return local.toUTC().toFormat('HH:mm');
}

export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = HOLIDAYS[year];
  if (!holidays) throw new Error(`No holidays found for year ${year}`);

  const dateString = date.toISOString().split('T')[0];
  return holidays?.has(dateString) ?? false;
}
