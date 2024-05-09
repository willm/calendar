import {Temporal} from '@js-temporal/polyfill';
import {Calendar, Event, APIEvent} from './model';
import type {EventStore} from './event-db';
import {parseCalendar} from './parse-calendar/parse-calendar';

function getSundayTimestamp(baseDay: Temporal.ZonedDateTime): number {
  const sunday = Temporal.Instant.from(
    baseDay.subtract({days: baseDay.dayOfWeek}).toInstant()
  );
  return sunday.epochMilliseconds;
}

function getSaturdayTimestamp(baseDay: Temporal.ZonedDateTime): number {
  return Temporal.Instant.from(baseDay.add({days: 6}).toInstant())
    .epochMilliseconds;
}

async function getEventsForWeekIncluding(
  db: EventStore,
  baseDay: Temporal.ZonedDateTime
): Promise<Event[]> {
  const calendars = await db.getCalendars();

  const sundayTimestamp = getSundayTimestamp(baseDay);
  const saturdayTimestamp = getSaturdayTimestamp(baseDay);

  const apiEvents = await db.getEventsBetween(
    sundayTimestamp,
    saturdayTimestamp
  );
  return apiEvents.map((e: APIEvent): Event => {
    return {
      ...e,
      calendar: calendars.find((c) => c.uid === e.calendarId),
      start: Temporal.Instant.from(e.start),
      end: Temporal.Instant.from(e.end),
    };
  });
}

export async function getCalendar(
  db: EventStore,
  dayWithinView: Temporal.ZonedDateTime,
  now: Temporal.ZonedDateTime,
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): Promise<Calendar> {
  const events = await getEventsForWeekIncluding(db, dayWithinView);
  return parseCalendar(events, dayWithinView, now, formatOpts);
}
