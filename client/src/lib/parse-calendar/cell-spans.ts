import {Temporal} from '@js-temporal/polyfill';
import {Event as Evt} from '../model';
import {occursWithinHour} from '../ranges';
type Event = Pick<Evt, 'start' | 'end'>;

export function getCellSpans(
  events: Event[],
  baseDay: Temporal.ZonedDateTime,
  zoneOptions: Intl.ResolvedDateTimeFormatOptions
): {
  span: number;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
}[] {
  const midnight = baseDay.round({smallestUnit: 'day', roundingMode: 'floor'});
  const cells = [];
  let hour = 0;
  while (hour < 24) {
    const hourStart = midnight.add({hours: hour});
    const eventDurations: Event[] = events
      .filter((event) => occursWithinHour(hourStart, event))
      .sort((a, b) =>
        Temporal.Duration.compare(a.start.until(a.end), b.start.until(b.end))
      );
    const longestEvent = eventDurations.length ? eventDurations[0] : null;
    if (!longestEvent) {
      cells.push({
        span: 1,
        start: Temporal.ZonedDateTime.from({
          year: baseDay.year,
          month: baseDay.month,
          day: baseDay.day,
          hour: hour,
          timeZone: zoneOptions.timeZone,
        }),
        end: Temporal.ZonedDateTime.from({
          year: baseDay.year,
          month: baseDay.month,
          day: baseDay.day,
          hour: hour + 1,
          timeZone: zoneOptions.timeZone,
        }),
      });
      hour += 1;
      continue;
    }
    let {start, end} = longestEvent;
    const duration =
      end.toZonedDateTime(zoneOptions).hour -
      start.toZonedDateTime(zoneOptions).hour;
    cells.push({
      span: duration,
      start: longestEvent.start.toZonedDateTime(zoneOptions),
      end: longestEvent.end.toZonedDateTime(zoneOptions),
    });
    hour += duration;
  }
  return cells;
}
