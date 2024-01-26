import {renderCalendar} from './lib/calendar-view.js';
import {getData} from './lib/get-data.js';
import {connect} from './lib/event-db.js';
import * as api from './lib/api.js';

function registerAddCalendarButton() {
  const dialog = document.getElementById('add-calendar-modal');
  const closeButton = document.getElementById('close-calendar-modal');
  closeButton.addEventListener('click', () => dialog.close());
  document
    .getElementById('add-calendar-button')
    .addEventListener('click', () => {
      dialog.showModal();
    });

  const form = document.getElementById('add-calendar-form');
  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const link = document.getElementById('ical-link').value;
    console.log(link);
    const icalData = await api.addCalendar(link);
    const db = await connect();
    await Promise.all(icalData.events.map((e) => db.saveEvent(e)));

    console.log(icalData);
  });
}

async function main() {
  registerAddCalendarButton();
  renderCalendar(await getData());
  setInterval(async () => renderCalendar(await getData()), 10000);
}

main();
