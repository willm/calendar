import {expect, test} from 'vitest';
import {getCalendar, occursWithin} from './get-calendar';
import {Temporal} from '@js-temporal/polyfill';
import type {RemoteCalendar} from './model';
import type {EventStore} from './event-db';

test('A plain date is mapped to a calendar', async () => {
  const mockStore: EventStore = {
    getCalendars() {
      return Promise.resolve([]);
    },
    getEventsBetween(_start: number, _end: number) {
      return Promise.resolve([]);
    },
    saveEvent(_event) {
      return Promise.resolve();
    },
    saveCalendar(_calendar: RemoteCalendar) {
      return Promise.resolve();
    },
  };
  const now = Temporal.PlainDateTime.from({
    day: 2,
    month: 2,
    year: 2024,
    hour: 19,
    minute: 35,
  });

  const calendar = await getCalendar(mockStore, now);

  expect(calendar).toMatchObject({
    dayOfMonth: 2,
    dayOfWeek: 'Friday',
    month: 'February',
    year: 2024,
  });
  expect(calendar.weekDays.length).toBe(5);
  expect(calendar.weekDays.map((d) => d.name)).toEqual([
    'Monday 29',
    'Tuesday 30',
    'Wednesday 31',
    'Thursday 1',
    'Friday 2',
  ]);
  expect(calendar.weekDays.map((d) => d.highlight)).toEqual([
    false,
    false,
    false,
    false,
    true,
  ]);
  expect(calendar.hour).toBe(19);
  expect(calendar.weekDays.length).toBe(5);
});

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
  const actual = occursWithin(
    Temporal.PlainDateTime.from({
      ...feb24,
      day: 4,
      hour: 8,
      minute: 0,
    }),
    {
      start,
      end,
      uid: '123',
      summary: 'Full day event',
      timestamp: 123,
    }
  );
  expect(actual).toBe(true);

  const actual2 = occursWithin(
    Temporal.PlainDateTime.from({
      ...feb24,
      day: 5,
      hour: 8,
      minute: 0,
    }),
    {
      start,
      end,
      uid: '123',
      summary: 'Full day event',
      timestamp: 123,
    }
  );
  expect(actual2).toBe(false);
});
