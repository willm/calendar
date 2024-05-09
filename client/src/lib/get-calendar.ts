import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {Calendar, WeekDay, Event, APIEvent, CellData} from './model';
import type {EventStore} from './event-db';
import {getCellSpans} from './parse-calendar/cell-spans.js';

export async function getCalendar(
  db: EventStore,
  baseDay: Temporal.ZonedDateTime,
  now: Temporal.PlainDateTime,
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): Promise<Calendar> {
  const calendars = await db.getCalendars();

  const sunday = Temporal.Instant.from(
    baseDay.subtract({days: baseDay.dayOfWeek}).toInstant()
  );
  const sundayTimestamp = sunday.epochMilliseconds;

  const saturdayTimestamp = Temporal.Instant.from(
    baseDay.add({days: 6}).toInstant()
  ).epochMilliseconds;

  const apiEvents: APIEvent[] = await db.getEventsBetween(
    sundayTimestamp,
    saturdayTimestamp
  );

  const events = apiEvents.map((e: APIEvent): Event => {
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
          cells: mapCells(
            baseDay,
            {
              highlight: highlightDay,
              events: events.filter((event) =>
                occursWithinDay(currentDay, event)
              ),
            },
            formatOpts
          ),
        };
      })
      .slice(1, 6),
    dayOfWeek,
    month,
    dayOfMonth,
    year: baseDay.year,
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

export function occursWithinHour(
  currentTime: Temporal.ZonedDateTime,
  event: Range
): boolean {
  const hourStart = currentTime.round({
    smallestUnit: 'hour',
    roundingMode: 'floor',
  });
  const hourEnd = hourStart.add({hours: 1});
  return occursWithin(
    {start: hourStart.toInstant(), end: hourEnd.toInstant()},
    {start: event.start, end: event.end}
  );
}

type Range = {start: Temporal.Instant; end: Temporal.Instant};

function occursWithin(range: Range, query: Range): boolean {
  const startsBeforeEnd = query.start.since(range.end).sign == -1;
  const endsAfterStart = query.end.since(range.start).sign == 1;
  return startsBeforeEnd && endsAfterStart;
}

export function occursWithinDay(
  currentDay: Temporal.ZonedDateTime,
  event: Event
): boolean {
  const dayStart = currentDay.round({
    smallestUnit: 'day',
    roundingMode: 'floor',
  });
  const dayEnd = dayStart.add({days: 1});
  return occursWithin(
    {start: dayStart.toInstant(), end: dayEnd.toInstant()},
    {start: event.start, end: event.end}
  );
}
