import {connect} from '../event-db';
import * as api from '../api';
import type {RemoteCalendar, SerialisedEvent} from '../model';

export async function addCalendar(
  link: string,
  calendar: RemoteCalendar
): Promise<void> {
  const icalData = await api.addCalendar(link);
  const db = await connect();
  db.saveCalendar(calendar);
  await Promise.all(
    icalData.events.map((e: SerialisedEvent) => {
      e.calendarId = calendar.uid;
      return db.saveEvent(e);
    })
  );
}
