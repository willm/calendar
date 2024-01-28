import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './constants.js';
import {connect} from './event-db.js';
import {Calendar} from './model.js';

export async function getData(): Promise<Calendar> {
  const db = await connect();

  const n = Temporal.Now;
  const now = n.plainDateISO();

  const sundayTimestamp = Temporal.Instant.from(
    now.subtract({days: now.dayOfWeek}).toZonedDateTime('UTC').toInstant()
  ).epochMilliseconds;

  const saturdayTimestamp = Temporal.Instant.from(
    now
      .subtract({days: now.dayOfWeek - 6})
      .toZonedDateTime('UTC')
      .toInstant()
  ).epochMilliseconds;

  const events = (
    await db.getEventsBetween(sundayTimestamp, saturdayTimestamp)
  ).map((e) => {
    return {
      ...e,
      start: Temporal.Instant.from(e.start),
      end: Temporal.Instant.from(e.end),
    };
  });
  console.log(events);

  const dayOfMonth = now.toPlainMonthDay().day;
  const dayOfWeek = days[now.dayOfWeek % 7];
  return {
    weekDays: days.map((day, i) => {
      const highlightDay = (now.dayOfWeek % 7) - i === 0;
      return {
        highlight: highlightDay,
        name:
          day +
          ' ' +
          now.subtract({days: (now.dayOfWeek % 7) - i}).toPlainMonthDay().day,
        hours: Array.from({length: 24}, (_, i) => ({
          name: '',
          highlight: highlightDay && i === new Date().getHours(),
        })),
      };
    }),
    dayOfWeek,
    month: months[now.month - 1],
    dayOfMonth,
    year: now.year,
  };
}
