import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {Calendar, WeekDay, Event, APIEvent, CellData} from './model';
import type {EventStore} from './event-db';
import {getCellSpans} from './parse-calendar/cell-spans.js';
import {occursWithinDay, occursWithinHour} from './ranges.js';

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

function getDayOfWeekName(baseDay: Temporal.ZonedDateTime): string {
  const dayOfWeek = days[baseDay.dayOfWeek % 7];
  if (dayOfWeek === undefined) {
    throw new Error("Couldn't parse day of the week");
  }
  return dayOfWeek;
}

function getMonthName(baseDay: Temporal.ZonedDateTime): string {
  const month = months[baseDay.month - 1];
  if (month === undefined) {
    throw new Error("Couldn't parse month");
  }
  return month;
}

export async function getCalendar(
  db: EventStore,
  baseDay: Temporal.ZonedDateTime,
  now: Temporal.PlainDateTime,
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): Promise<Calendar> {
  const events = await getEventsForWeekIncluding(db, baseDay);

  const dayOfMonth = baseDay.toPlainMonthDay().day;
  const dayOfWeek = getDayOfWeekName(baseDay);
  const monthName = getMonthName(baseDay);
  return {
    hour: baseDay.hour,
    weekDays: days
      .map((_, i): WeekDay => {
        const currentDay = baseDay.subtract({
          days: (baseDay.dayOfWeek % 7) - i,
        });
        return mapDay(baseDay, currentDay, now, events, formatOpts);
      })
      .slice(1, 6),
    dayOfWeek,
    month: monthName,
    dayOfMonth,
    year: baseDay.year,
  };
}

function mapDay(
  today: Temporal.ZonedDateTime,
  day: Temporal.ZonedDateTime,
  now: Temporal.PlainDateTime,
  events: Event[],
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): WeekDay {
  const highlightDay =
    day.day === now.day && day.month === now.month && day.year === now.year;

  return {
    highlight: highlightDay,
    name: `${days[day.dayOfWeek]} ${day.toPlainMonthDay().day}`,
    cells: mapCells(
      today,
      {
        highlight: highlightDay,
        events: events.filter((event) => occursWithinDay(day, event)),
      },
      formatOpts
    ),
  };
}

export function mapCells(
  currentDateTime: Temporal.ZonedDateTime,
  day: {highlight: boolean; events: Event[]},
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): CellData[] {
  const cellSpans = getCellSpans(day.events, currentDateTime, formatOpts);
  return cellSpans.map((eventSpan): CellData => {
    const classes: string[] = [];
    if (day.highlight) {
      classes.push('current-day');
    }

    const cellStart = eventSpan.start.hour;
    const cellEnd = eventSpan.end.hour;
    if (
      currentDateTime.hour >= cellStart &&
      currentDateTime.hour < cellEnd &&
      day.highlight
    ) {
      classes.push('current-time');
    }
    const eventsInHour = day.events.filter(
      occursWithinHour.bind(null, eventSpan.start)
    );
    const events = eventsInHour.map((e) => {
      const duration = e.end.since(e.start).total('minutes');
      const height = Math.min(100, (duration / 60) * 100);
      const insetTop = (e.start.toZonedDateTime(formatOpts).minute / 60) * 100;
      const color = e.calendar?.color || 'yellow';
      return {color, height, insetTop, ...e};
    });
    return {classes, events, rowSpan: eventSpan.span};
  });
}
