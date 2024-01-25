import {Temporal} from '@js-temporal/polyfill';
import {days, months} from './lib/constants.js';
import {renderCalendar} from './lib/calendar-view.js';

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
    const res = await fetch(link);
    const icalData = res.text();
    console.log(icalData);
  });
}

function getData() {
  const now = Temporal.Now.plainDateISO();
  const dayOfMonth = now.toPlainMonthDay().day;
  const dayOfWeek = days[now.dayOfWeek];
  return {
    weekDays: days.map((day, i) => {
      return {
        highlight: now.dayOfWeek - i === 0,
        name:
          day +
          ' ' +
          Temporal.Now.plainDateISO()
            .subtract({days: now.dayOfWeek - i})
            .toPlainMonthDay().day,
      };
    }),
    dayOfWeek,
    month: months[now.month - 1],
    dayOfMonth,
    year: now.year,
    hours: Array.from({length: 24}, (_, i) => ({
      name: i.toString().padStart(2, '0') + ':00',
      highlight: i === new Date().getHours(),
    })),
  };
}

function main() {
  registerAddCalendarButton();
  renderCalendar(getData());
  setInterval(() => renderCalendar(getData()), 10000);
}

main();
