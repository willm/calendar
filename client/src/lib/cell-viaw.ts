import {WeekDay} from './model';

export function cell(currentHour: number, hour: number, day: WeekDay): string {
  const element = document.createElement('td');
  if (day.highlight) {
    element.classList.add('current-day');
  }
  if (currentHour === hour && day.highlight) {
    element.classList.add('current-time');
  }

  element.innerHTML = `<ul style="list-style-type: none">${day.events
    .filter((e) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions();
      return e.start.toZonedDateTime(timeZone).hour === hour;
    })
    .map(
      (e) =>
        `<li style="background-color: ${e.calendar?.color}">${e.summary}
        </li>`
    )
    .join('')}</ul>`;
  return element.outerHTML;
}
