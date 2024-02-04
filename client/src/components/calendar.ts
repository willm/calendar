import {App} from '../lib/app-state';
import {cell} from '../lib/cell-viaw';
import {Calendar} from '../lib/model';

function formatHour(hourIndex: number): string {
  return hourIndex.toString().padStart(2, '0') + ':00';
}

class CalendarElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const table = document.createElement('table');
    shadowRoot.appendChild(table);
    App.get().on('calendar', (evt) => {
      const calendar = (evt as CustomEvent).detail as Calendar;
      table.innerHTML = `<thead>
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
              let hour = day.hours[hourIndex];
              if (hour === undefined) {
                throw new Error('day does not have enough hours');
              }
              return cell(hour, day);
            })
            .join('')}
        </tr>`
      ).join('')}
    </tbody>`;
    });
  }
}
customElements.define('cal-calendar', CalendarElement);
