import {App} from '../lib/app-state';
import {cell} from './cell-view';
import {Calendar} from '../lib/model';

function formatHour(hourIndex: number): string {
  return hourIndex.toString().padStart(2, '0') + ':00';
}

class CalendarElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const table = document.createElement('table');
    this.appendChild(table);
    App.get().on('calendar', (evt) => {
      const calendar = (evt as CustomEvent).detail as Calendar;
      table!.innerHTML = `<thead>
      <tr>
        <th />
        ${calendar.weekDays
          .map(
            (day) => `<th ${day.highlight ? 'class="current-day"' : ''}>
            <h2>${day.name}</h2>
          </th>`
          )
          .join('')}
      </tr>
    </thead>
    <tbody>
      ${Array.from(
        {length: 24},
        (_hour, hourIndex) => `<tr>
          <td>${formatHour(hourIndex)}</td>
          ${calendar.weekDays
            .map((day) => {
              return cell(calendar.hour, hourIndex, day);
            })
            .join('')}
        </tr>`
      ).join('')}
    </tbody>`;
      const currentCell = table.querySelector('.current-day.current-time');
      currentCell?.scrollIntoView();
    });
  }
}
customElements.define('cal-calendar', CalendarElement);
