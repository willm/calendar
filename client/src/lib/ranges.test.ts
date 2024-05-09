import {Temporal} from '@js-temporal/polyfill';
import {expect, test} from 'vitest';
import {occursWithinDay, occursWithinHour} from './ranges';

test('a whole day event only occurs during 1 day', () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const feb24 = {
    month: 2,
    year: 2024,
  };
  const start = Temporal.ZonedDateTime.from({
    ...feb24,
    day: 4,
    hour: 0,
    minute: 0,
    timeZone,
  }).toInstant();

  const end = Temporal.ZonedDateTime.from({
    ...feb24,
    day: 5,
    hour: 0,
    minute: 0,
    timeZone,
  }).toInstant();
  const actual = occursWithinDay(
    Temporal.ZonedDateTime.from({
      ...feb24,
      day: 4,
      hour: 8,
      minute: 0,
      timeZone,
    }),
    {
      start,
      end,
    }
  );
  expect(actual).toBe(true);

  const actual2 = occursWithinDay(
    Temporal.ZonedDateTime.from({
      ...feb24,
      day: 5,
      hour: 8,
      minute: 0,
      timeZone,
    }),
    {
      start,
      end,
    }
  );
  expect(actual2).toBe(false);
});

test('an event occurring after the current time', () => {
  const within = occursWithinHour(
    Temporal.ZonedDateTime.from({
      year: 2024,
      month: 3,
      day: 21,
      hour: 0,
      timeZone,
    }),
    {
      start: Temporal.Instant.from('2024-03-21T15:00:00Z'),
      end: Temporal.Instant.from('2024-03-21T17:00:00Z'),
    }
  );
  expect(within).toBe(false);
});

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
test('an event ending at the current time is not included', () => {
  const within = occursWithinHour(
    Temporal.ZonedDateTime.from({
      year: 2024,
      month: 3,
      day: 21,
      hour: 16,
      timeZone: 'UTC',
    }),
    {
      start: Temporal.Instant.from('2024-03-21T15:00:00Z'),
      end: Temporal.Instant.from('2024-03-21T16:00:00Z'),
    }
  );
  expect(within).toBe(false);
});
