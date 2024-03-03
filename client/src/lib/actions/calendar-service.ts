import {EventStore} from '../event-db';
import {API} from '../api';
import type {APIEvent, RemoteCalendar} from '../model';

export function calendarService(api: API, db: EventStore) {
  return {addCalendar: addCalendar.bind(null, api, db)};
}

export async function addCalendar(
  api: API,
  db: EventStore,
  link: string,
  calendar: RemoteCalendar
): Promise<void> {
  const icalData = await api.getCalendar(link);
  const events: APIEvent[] = Object.entries(icalData)
    .filter(([_, event]) => event.start)
    .map(([uid, event]) => {
      console.log(event);
      return {
        uid,
        summary: event.summary,
        timestamp: event.start.valueOf(),
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        calendarId: calendar.uid,
      };
    });
  await Promise.all(events.map((e: APIEvent) => db.saveEvent(e)));
}
