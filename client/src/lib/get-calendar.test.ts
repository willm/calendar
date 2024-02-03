import {expect, test} from 'vitest';
import {getCalendar} from './get-calendar';
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
  expect(calendar.weekDays.every((d) => d.hours.length === 24)).toBe(true);
  const monday = calendar.weekDays[0]!;
  expect(monday.hours.length).toBe(24);
  const midnight = monday.hours[0]!;
  expect(midnight.highlight).toBe(false);
  expect(midnight.events.length).toBe(0);
});
