import {renderCalendar} from './lib/calendar-view.js';
import {getCalendar} from './lib/get-calendar.js';
import {connect} from './lib/event-db.js';
import * as api from './lib/api.js';
import {RemoteCalendar, SerialisedEvent} from './lib/model.js';
import {Temporal} from '@js-temporal/polyfill';

function refreshButton() {
  const button = document.getElementById('refresh-button');
  button?.addEventListener('click', async () => {
    const db = await connect();
    const calendars = await db.getCalendars();
    await Promise.all(
      calendars.map(async (c: RemoteCalendar) => {
        const icalData = await api.addCalendar(c.url);
        return await Promise.all(
          icalData.events.map((e: SerialisedEvent) => {
            e.calendarId = c.uid;
            return db.saveEvent(e);
          })
        );
      })
    );
  });
}

function registerAddCalendarButton() {
  const dialog = document.getElementById(
    'add-calendar-modal'
  ) as HTMLDialogElement;
  const closeButton = document.getElementById('close-calendar-modal');
  const addCalButton = document.getElementById('add-calendar-button');
  const submitCalButton = document.getElementById('add-calendar-submit-button');
  closeButton?.addEventListener('click', () => dialog?.close());
  addCalButton?.addEventListener('click', () => {
    dialog?.showModal();
  });

  const form = document.getElementById('add-calendar-form') as HTMLFormElement;
  form?.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    submitCalButton!.innerHTML = '<div class="loader" />';
    const link = (document.getElementById('ical-link') as HTMLInputElement)
      ?.value;
    const name = (document.getElementById('calendar-name') as HTMLInputElement)
      ?.value;
    console.log(link);
    const calendar: RemoteCalendar = {
      uid: crypto.randomUUID().toString(),
      name: name,
      // TODO: color picker
      color: 'blue',
      url: link,
    };
    const icalData = await api.addCalendar(link);
    const db = await connect();
    db.saveCalendar(calendar);
    await Promise.all(
      icalData.events.map((e: SerialisedEvent) => {
        e.calendarId = calendar.uid;
        return db.saveEvent(e);
      })
    );

    console.log(icalData);
    submitCalButton!.innerText = 'OK';
    dialog.close();
  });
}

async function main() {
  registerAddCalendarButton();
  refreshButton();

  const store = await connect();
  renderCalendar(await getCalendar(store, Temporal.Now.plainDateTimeISO()));
  setInterval(
    async () =>
      renderCalendar(await getCalendar(store, Temporal.Now.plainDateTimeISO())),
    300000
  );
}

main();
