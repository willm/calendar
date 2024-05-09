import {expect, test} from 'vitest';
import {Temporal} from '@js-temporal/polyfill';
import {getCellSpans} from './cell-spans';

const utcOpts = Intl.DateTimeFormat('en-UK', {
  timeZone: 'UTC',
}).resolvedOptions();

test('getting cell spans for a day with no events', () => {
  const cells = getCellSpans(
    [],
    Temporal.ZonedDateTime.from({
      year: 2024,
      month: 4,
      day: 20,
      timeZone: Temporal.TimeZone.from('utc'),
    }),
    utcOpts
  );
  expect(cells.length).toEqual(24);
});

test('getting cell spans for a day with an event', () => {
  const events = [
    {
      start: Temporal.Instant.from('2024-04-17T00:00:00Z'),
      end: Temporal.Instant.from('2024-04-17T03:00:00Z'),
    },
  ];
  const cells = getCellSpans(
    events,
    Temporal.ZonedDateTime.from({
      year: 2024,
      month: 4,
      day: 17,
      timeZone: Temporal.TimeZone.from('utc'),
    }),
    utcOpts
  );
  expect(cells.length).toEqual(22);
  expect(cells[0]?.span).toEqual(3);
});

test('getting cell spans for a day with an event', () => {
  const events = [
    {
      start: Temporal.Instant.from('2024-04-16T00:00:00Z'),
      end: Temporal.Instant.from('2024-04-16T02:00:00Z'),
    },
  ];
  const cells = getCellSpans(
    events,
    Temporal.ZonedDateTime.from({
      year: 2024,
      month: 4,
      day: 16,
      timeZone: 'utc',
    }),
    utcOpts
  );
  expect(cells.length).toEqual(23);
});
