import {parseCalendar, mapCells} from './parse-calendar.js';
import {Temporal} from '@js-temporal/polyfill';
import type {Event, RemoteCalendar} from '../model';
import {expect, test} from 'vitest';

test('A plain date is mapped to a calendar', () => {
  const timeZone = 'UTC';
  const baseDay = Temporal.ZonedDateTime.from({
    day: 2,
    month: 2,
    year: 2024,
    timeZone,
  });
  const now = Temporal.ZonedDateTime.from({
    day: 2,
    month: 2,
    year: 2024,
    timeZone,
    hour: 19,
    minute: 35,
  });
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone});

  const calendar = parseCalendar(
    [],
    baseDay,
    now,
    formatOpts.resolvedOptions()
  );

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
  expect(calendar.weekDays.length).toBe(5);
});

const instant = (s: string) => Temporal.Instant.from(s);
const rc = (name: string): RemoteCalendar => ({
  color: 'red',
  uid: 'foo',
  name,
  url: 'https://example.com',
});
const remoteCal = rc('abc');

test('an other week', () => {
  const events: Event[] = [
    {
      uid: '0mm6qkt8j8qt78kmid96os5065@google.com',
      summary: '[BBL] La gestion des tâches par Augustin G.',
      timestamp: 1717412400000,
      start: instant('2024-06-03T11:00:00Z'),
      end: instant('2024-06-03T12:00:00Z'),
      calendar: remoteCal,
    },
    {
      uid: '0stni020stqbbcom0m4spd5csq@google.com',
      summary: 'Summer Party Lyon',
      timestamp: 1717691400000,
      start: instant('2024-06-06T16:30:00Z'),
      end: instant('2024-06-06T20:30:00Z'),
      calendar: remoteCal,
    },
    {
      uid: '12k42rui9mksbi6vu5eavop80b@google.com',
      summary: '[SAVE THE DATE - Soirée CSE] Soirée Disney 🧜‍♀️🧞‍♂️🏰',
      timestamp: 1718121600000,
      start: instant('2024-06-11T16:00:00Z'),
      end: instant('2024-06-11T20:30:00Z'),
      calendar: remoteCal,
    },
  ];
  const baseDay = Temporal.ZonedDateTime.from(
    '2024-06-06T14:12:50.653970642Z[UTC]'
  );
  const now = Temporal.ZonedDateTime.from(
    '2024-05-09T14:12:50.653970642Z[UTC]'
  );
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC'});
  debugger;
  const calendar = parseCalendar(
    events,
    baseDay,
    now,
    formatOpts.resolvedOptions()
  );

  debugger;
  expect(calendar.weekDays[0]?.cells[11]?.events.length).toEqual(1);
  expect(calendar.weekDays[3]?.cells[16]?.events.length).toEqual(1);
  expect(calendar.weekDays[3]?.cells[16]?.rowSpan).toEqual(4);
  expect(calendar.weekDays[3]?.cells[16]?.events[0]?.insetTop).toEqual(12.5);
});

test('a real life week', () => {
  const events: Event[] = [
    {
      uid: '1',
      calendar: remoteCal,
      summary: 'lunch event',
      timestamp: 1713351600000,
      end: Temporal.Instant.from('2024-04-17T12:00:00.000Z'),
      start: Temporal.Instant.from('2024-04-17T11:00:00.000Z'),
    },
    {
      uid: '2',
      calendar: remoteCal,
      summary: 'company update',
      timestamp: 1713351600000,
      end: instant('2024-04-18T16:30:00.000Z'),
      start: instant('2024-04-18T15:30:00.000Z'),
    },
    {
      uid: '3',
      calendar: remoteCal,
      summary: 'leaving drinks',
      timestamp: 1713544200000,
      end: instant('2024-04-19T22:00:00.000Z'),
      start: instant('2024-04-19T16:30:00.000Z'),
    },
    {
      uid: '4',
      calendar: remoteCal,
      summary: 'technical call',
      timestamp: 1713771000000,
      end: instant('2024-04-22T08:00:00.000Z'),
      start: instant('2024-04-22T07:30:00.000Z'),
    },
    {
      uid: '5',
      calendar: remoteCal,
      summary: 'security workshop',
      timestamp: 1713803400000,
      end: instant('2024-04-22T18:30:00.000Z'),
      start: instant('2024-04-22T16:30:00.000Z'),
    },
  ];
  const timeZone = 'UTC';
  const baseDay = Temporal.ZonedDateTime.from({
    day: 19,
    month: 4,
    year: 2024,
    timeZone,
  });
  const now = Temporal.ZonedDateTime.from({
    day: 19,
    month: 4,
    year: 2024,
    hour: 9,
    minute: 35,
    timeZone,
  });
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC'});
  const calendar = parseCalendar(
    events,
    baseDay,
    now,
    formatOpts.resolvedOptions()
  );

  expect(calendar.weekDays[4]?.name).toEqual('Friday 19');
  expect(calendar.weekDays[4]?.cells[0]?.classes).toEqual(['current-day']);
});

test('mapping cells from a day with no events returns 24 cells', () => {
  const now = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const baseDay = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const cells = mapCells(
    baseDay,
    now,
    {highlight: true, events: []},
    Intl.DateTimeFormat().resolvedOptions()
  );
  expect(cells).toHaveLength(24);
  expect(
    cells.map((cell) => cell.rowSpan).every((rowSpan) => rowSpan === 1)
  ).toEqual(true);
  expect(
    cells.map((cell) => cell.events.length).every((length) => length === 0)
  ).toEqual(true);
});

test('an event lasting a full hour is contained to 1 cell', () => {
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC'});
  const now = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const baseDay = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const cells = mapCells(
    baseDay,
    now,
    {
      highlight: true,
      events: [
        {
          uid: '1',
          summary: 'An event',
          start: Temporal.Instant.from('2024-03-21T16:00:00Z'),
          timestamp: 0,
          end: Temporal.Instant.from('2024-03-21T17:00:00Z'),
        },
      ],
    },
    formatOpts.resolvedOptions()
  );
  expect(cells).toHaveLength(24);
  expect(cells[16]?.events).toHaveLength(1);
  expect(cells[17]?.events).toHaveLength(0);
});

test('events happening at the same time are in the same cell', () => {
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC'});
  const now = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const baseDay = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const cells = mapCells(
    baseDay,
    now,
    {
      highlight: false,
      events: [
        {
          uid: '1',
          summary: 'An event',
          start: Temporal.Instant.from('2024-03-21T22:00:00Z'),
          timestamp: 0,
          end: Temporal.Instant.from('2024-03-21T23:00:00Z'),
        },
        {
          uid: '2',
          summary: 'An other event',
          start: Temporal.Instant.from('2024-03-21T22:00:00Z'),
          timestamp: 0,
          end: Temporal.Instant.from('2024-03-21T23:00:00Z'),
        },
      ],
    },
    formatOpts.resolvedOptions()
  );
  expect(cells).toHaveLength(24);
  expect(cells[22]?.events).toHaveLength(2);
  expect(cells[22]?.rowSpan).toEqual(1);
});

test('a day containing events lasting more than an hour merges cells', () => {
  const formatOpts = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC'});
  const baseDay = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const now = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 21,
    timeZone: 'UTC',
  });
  const cells = mapCells(
    baseDay,
    now,
    {
      highlight: false,
      events: [
        {
          uid: '1',
          summary: 'An event',
          start: Temporal.Instant.from('2024-03-21T15:00:00Z'),
          timestamp: 0,
          end: Temporal.Instant.from('2024-03-21T17:00:00Z'),
        },
      ],
    },
    formatOpts.resolvedOptions()
  );
  expect(cells).toHaveLength(23);
  expect(cells[15]?.rowSpan).toEqual(2);
  expect(cells[0]?.events).toHaveLength(0);
});
