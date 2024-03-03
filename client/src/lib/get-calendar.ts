import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {Calendar, WeekDay, Event, APIEvent} from './model.js';
import type {EventStore} from './event-db';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function getCalendar(
  db: EventStore,
  baseDay: Temporal.PlainDateTime,
  now = Temporal.Now.plainDateTimeISO()
): Promise<Calendar> {
  const calendars = await db.getCalendars();

  const sunday = Temporal.Instant.from(
    baseDay
      .subtract({days: baseDay.dayOfWeek})
      .toZonedDateTime(timeZone)
      .toInstant()
  );
  const sundayTimestamp = sunday.epochMilliseconds;

  const saturdayTimestamp = Temporal.Instant.from(
    baseDay.add({days: 6}).toZonedDateTime(timeZone).toInstant()
  ).epochMilliseconds;

  const events: Event[] = (
    await db.getEventsBetween(sundayTimestamp, saturdayTimestamp)
  ).map((e: APIEvent): Event => {
    return {
      ...e,
      calendar: calendars.find((c) => c.uid === e.calendarId),
      start: Temporal.Instant.from(e.start),
      end: Temporal.Instant.from(e.end),
    };
  });

  const dayOfMonth = baseDay.toPlainMonthDay().day;
  const dayOfWeek = days[baseDay.dayOfWeek % 7];
  if (dayOfWeek === undefined) {
    throw new Error("Couldn't parse day of the week");
  }
  const month = months[baseDay.month - 1];
  if (month === undefined) {
    throw new Error("Couldn't parse month");
  }
  return {
    hour: baseDay.hour,
    weekDays: days
      .map((day, i): WeekDay => {
        const currentDay = baseDay.subtract({
          days: (baseDay.dayOfWeek % 7) - i,
        });
        const highlightDay =
          currentDay.day === now.day &&
          currentDay.month === now.month &&
          currentDay.year === now.year;

        return {
          highlight: highlightDay,
          name: `${day} ${currentDay.toPlainMonthDay().day}`,
          events: events.filter((event) => occursWithin(currentDay, event)),
        };
      })
      .slice(1, 6),
    dayOfWeek,
    month,
    dayOfMonth,
    year: baseDay.year,
  };
}

export function occursWithin(
  currentDay: Temporal.PlainDateTime,
  event: Event
): boolean {
  const eventStart = event.start.toZonedDateTimeISO(timeZone);
  const eventEnd = event.end.toZonedDateTimeISO(timeZone);
  if (
    eventEnd.day === currentDay.day &&
    eventEnd.year === currentDay.year &&
    eventEnd.hour === 0 &&
    eventEnd.minute === 0 &&
    eventEnd.second === 0
  ) {
    return false;
  }
  return (
    eventStart.day <= currentDay.day &&
    eventStart.year === currentDay.year &&
    eventStart.month === currentDay.month &&
    eventEnd.day >= currentDay.day &&
    eventEnd.year >= currentDay.year &&
    eventEnd.month >= currentDay.month
  );
}
