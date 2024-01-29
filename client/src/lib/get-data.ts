import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {connect} from './event-db.js';
import {Calendar, WeekDay, Event, SerialisedEvent} from './model.js';

export async function getData(): Promise<Calendar> {
  const db = await connect();
  const calendars = await db.getCalendars();

  const n = Temporal.Now;
  const now = n.plainDateISO();

  const sunday = Temporal.Instant.from(
    now.subtract({days: now.dayOfWeek}).toZonedDateTime('UTC').toInstant()
  );
  const sundayTimestamp = sunday.epochMilliseconds;

  const saturdayTimestamp = Temporal.Instant.from(
    now.add({days: 6}).toZonedDateTime('UTC').toInstant()
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
    weekDays: days.map((day, i): WeekDay => {
      const highlightDay = (now.dayOfWeek % 7) - i === 0;
      const currentDay = now.subtract({days: (now.dayOfWeek % 7) - i});

      return {
        highlight: highlightDay,
        name: `${day} ${
          now.subtract({days: (now.dayOfWeek % 7) - i}).toPlainMonthDay().day
        }`,
        hours: Array.from({length: 24}, (_, i) => {
          const hourEvents = events.filter((event) => {
            const eventStart = event.start.toZonedDateTimeISO('UTC');
            const eventEnd = event.end.toZonedDateTimeISO('UTC');
            return (
              eventStart.day === currentDay.day &&
              eventStart.year === currentDay.year &&
              eventStart.month === currentDay.month &&
              eventStart.hour <= i &&
              eventEnd.hour > i
            );
          });
          return {
            highlight: highlightDay && i === new Date().getHours(),
            events: hourEvents,
          };
        }),
      };
    }),
    dayOfWeek,
    month: months[now.month - 1],
    dayOfMonth,
    year: now.year,
  };
}
