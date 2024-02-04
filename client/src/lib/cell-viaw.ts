import {Hour, WeekDay} from './model';

export function cell(hour: Hour, day: WeekDay): string {
  const element = document.createElement('td');
  if (day.highlight) {
    element.classList.add('current-day');
  }
  if (hour.highlight) {
    element.classList.add('current-time');
  }

  element.innerHTML = `<ul style="list-style-type: none">${hour.events
    .map(
      (e) =>
        `<li style="background-color: ${e.calendar?.color}">${e.summary}
        </li>`
    )
    .join('')}</ul>`;
  return element.outerHTML;
}
