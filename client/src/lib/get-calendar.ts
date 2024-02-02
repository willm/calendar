import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {Calendar, WeekDay, Event, SerialisedEvent} from './model.js';
import type {EventStore} from './event-db';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export async function getCalendar(
  db: EventStore,
  now: Temporal.PlainDateTime
): Promise<Calendar> {
  const calendars = await db.getCalendars();

  const sunday = Temporal.Instant.from(
    now.subtract({days: now.dayOfWeek}).toZonedDateTime(timeZone).toInstant()
  );
  const sundayTimestamp = sunday.epochMilliseconds;

  const saturdayTimestamp = Temporal.Instant.from(
    now.add({days: 6}).toZonedDateTime(timeZone).toInstant()
  ).epochMilliseconds;

  const events: Event[] = (
    await db.getEventsBetween(sundayTimestamp, saturdayTimestamp)
  ).map((e: SerialisedEvent): Event => {
    return {
      ...e,
      calendar: calendars.find((c) => c.uid === e.calendarId),
      start: Temporal.Instant.from(e.start),
      end: Temporal.Instant.from(e.end),
    };
  });

  const dayOfMonth = now.toPlainMonthDay().day;
  const dayOfWeek = days[now.dayOfWeek % 7];
  return {
    weekDays: days
      .map((day, i): WeekDay => {
        const highlightDay = (now.dayOfWeek % 7) - i === 0;
        const currentDay = now.subtract({days: (now.dayOfWeek % 7) - i});

        return {
          highlight: highlightDay,
          name: `${day} ${
            now.subtract({days: (now.dayOfWeek % 7) - i}).toPlainMonthDay().day
          }`,
          hours: Array.from({length: 24}, (_, hour) => {
            const hourEvents = events.filter((event) => {
              const eventStart = event.start.toZonedDateTimeISO(timeZone);
              const eventEnd = event.end.toZonedDateTimeISO(timeZone);
              return (
                eventStart.day === currentDay.day &&
                eventStart.year === currentDay.year &&
                eventStart.month === currentDay.month &&
                eventStart.hour >= hour &&
                eventStart.hour < hour + 1 &&
                eventEnd.hour <= hour + 1
              );
            });
            return {
              highlight: highlightDay && hour === now.hour,
              events: hourEvents,
            };
          }),
        };
      })
      .slice(1, 6),
    dayOfWeek,
    month: months[now.month - 1],
    dayOfMonth,
    year: now.year,
  };
}
