import {Temporal} from '@js-temporal/polyfill';

type Range = {start: Temporal.Instant; end: Temporal.Instant};

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

function occursWithin(range: Range, query: Range): boolean {
  const startsBeforeEnd = query.start.since(range.end).sign == -1;
  const endsAfterStart = query.end.since(range.start).sign == 1;
  return startsBeforeEnd && endsAfterStart;
}

export function occursWithinDay(
  currentDay: Temporal.ZonedDateTime,
  event: Range
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
