import {Calendar} from './model';

function table(calendar: Calendar) {
  return `<table>
    <thead>
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
      ${calendar.hours
        .map(
          (hour) => `<tr>
          <td>${hour.name}</td>
          ${calendar.weekDays
            .map((day) => {
              let classes = [];
              if (day.highlight) {
                classes.push('current-day');
              }
              if (day.highlight && hour.highlight) {
                classes.push('current-time');
              }
              return `<td ${
                classes.length ? `class="${classes.join(' ')}"` : ''
              }></td>`;
            })
            .join('')}
        </tr>`
        )
        .join('')}
    </tbody>
  </table>`;
}

export function renderCalendar(data: Calendar) {
  document.querySelector('main')?.remove();
  const el = document.createElement('main');
  const content = table(data);
  el.innerHTML = content;
  document.body.appendChild(el);
}
