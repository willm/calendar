import {renderCalendar} from './lib/calendar-view.js';
import {getData} from './lib/get-data.js';
import {connect} from './lib/event-db.js';
import * as api from './lib/api.js';
import {Calendar, Event, RemoteCalendar} from './lib/model.js';

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
    const name = (document.getElementById('calenday-name') as HTMLInputElement)
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
      icalData.events.map((e: Event) => {
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
  renderCalendar(await getData());
  setInterval(async () => renderCalendar(await getData()), 10000);
}

main();
