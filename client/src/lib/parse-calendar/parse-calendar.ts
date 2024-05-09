import {Temporal} from '@js-temporal/polyfill';
import {days, months} from '../constants.js';
import {Calendar, WeekDay, Event, CellData} from '../model';
import {getCellSpans} from './cell-spans.js';
import {occursWithinDay, occursWithinHour} from '../ranges.js';

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

export function parseCalendar(
  events: Event[],
  dayWithinView: Temporal.ZonedDateTime,
  now: Temporal.ZonedDateTime,
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): Calendar {
  const dayOfMonth = dayWithinView.toPlainMonthDay().day;
  const dayOfWeek = getDayOfWeekName(dayWithinView);
  const monthName = getMonthName(dayWithinView);
  return {
    weekDays: days
      .map((_, i): WeekDay => {
        const currentDay = dayWithinView.subtract({
          days: (dayWithinView.dayOfWeek % 7) - i,
        });
        return mapDay(currentDay, now, events, formatOpts);
      })
      .slice(1, 6),
    dayOfWeek,
    month: monthName,
    dayOfMonth,
    year: dayWithinView.year,
  };
}

function areTheSameDay(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime
): boolean {
  return a.day === b.day && a.month === b.month && a.year === b.year;
}

function mapDay(
  dayOfWeek: Temporal.ZonedDateTime,
  now: Temporal.ZonedDateTime,
  events: Event[],
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): WeekDay {
  const highlightDay = areTheSameDay(dayOfWeek, now);

  return {
    highlight: highlightDay,
    name: `${days[dayOfWeek.dayOfWeek]} ${dayOfWeek.toPlainMonthDay().day}`,
    cells: mapCells(
      now,
      {
        highlight: highlightDay,
        events: events.filter((event) => occursWithinDay(dayOfWeek, event)),
      },
      formatOpts
    ),
  };
}

export function mapCells(
  now: Temporal.ZonedDateTime,
  day: {highlight: boolean; events: Event[]},
  formatOpts: Intl.ResolvedDateTimeFormatOptions
): CellData[] {
  const cellSpans = getCellSpans(day.events, now, formatOpts);
  return cellSpans.map((eventSpan): CellData => {
    const classes: string[] = [];
    if (day.highlight) {
      classes.push('current-day');
    }

    const cellStart = eventSpan.start.hour;
    const cellEnd = eventSpan.end.hour;
    if (now.hour >= cellStart && now.hour < cellEnd && day.highlight) {
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
