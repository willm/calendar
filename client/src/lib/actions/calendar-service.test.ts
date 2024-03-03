import {expect, test} from 'vitest';
import {APIEvent, RemoteCalendar} from '../model';
import {EventStore} from '../event-db';
import {calendarService} from './calendar-service';
import {API} from '../api';

class TestDB implements EventStore {
  constructor(
    public readonly calenters: RemoteCalendar[] = [],
    public readonly events: APIEvent[] = []
  ) {}
  saveCalendar(calendar: RemoteCalendar) {
    this.calenters.push(calendar);
    return Promise.resolve();
  }
  saveEvent(event: APIEvent) {
    this.events.push(event);
    return Promise.resolve();
  }
  getCalendars() {
    return Promise.reject(new Error('not implemented'));
  }
  getEventsBetween(_start: number, _end: number) {
    return Promise.reject(new Error('not implemented'));
  }
}

test('Calendar is persisted', async () => {
  const db = new TestDB();
  const api: API = {
    getCalendar(_link: string) {
      return Promise.resolve({
        eventA: {
          summary: 'Dinner with Kate',
          start: new Date('2024-02-06T20:00:00.000Z'),
          end: new Date('2024-02-06T22:00:00.000Z'),
        },
        eventB: {
          summary: 'Skydiving lesson',
          start: new Date('2024-02-09T10:00:00.000Z'),
          end: new Date('2024-02-09T14:00:00.000Z'),
        },
      });
    },
  };
  await calendarService(api, db).addCalendar('https://my.events.com', {
    uid: 'abcd',
    name: 'My Events',
    color: 'red',
    url: 'https://my.events.com',
  });

  expect(db.events).toHaveLength(2);
  const events = db.events;
  expect(events[0]).toEqual({
    calendarId: 'abcd',
    summary: 'Dinner with Kate',
    start: '2024-02-06T20:00:00.000Z',
    end: '2024-02-06T22:00:00.000Z',
    timestamp: 1707249600000,
    uid: 'eventA',
  } as APIEvent);
  expect(events[1]).toEqual({
    summary: 'Skydiving lesson',
    start: '2024-02-09T10:00:00.000Z',
    end: '2024-02-09T14:00:00.000Z',
    calendarId: 'abcd',
    timestamp: 1707472800000,
    uid: 'eventB',
  } as APIEvent);
});
