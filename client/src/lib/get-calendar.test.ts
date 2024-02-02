import {expect, test} from 'vitest';
import {getCalendar} from './get-calendar';
import {Temporal} from '@js-temporal/polyfill';
import type {RemoteCalendar} from './model';
import type {EventStore} from './event-db';

test('', async () => {
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
    day: 3,
    month: 2,
    year: 2024,
    hour: 19,
    minute: 35,
  });

  const calendar = await getCalendar(mockStore, now);

  expect(calendar).toMatchObject({
    dayOfMonth: 3,
    dayOfWeek: 'Saturday',
    month: 'February',
    year: 2024,
  });
  expect(calendar.weekDays.length).toBe(5);
  const monday = calendar.weekDays[0];
  expect(monday.name).toBe('Monday 29');
  expect(monday.highlight).toBe(false);
  expect(monday.hours.length).toBe(24);
  const midnight = monday.hours[0];
  expect(midnight.highlight).toBe(false);
  expect(midnight.events.length).toBe(0);
});
