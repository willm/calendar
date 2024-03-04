import {WeekDay} from '../lib/model';

export function cell(currentHour: number, hour: number, day: WeekDay): string {
  const element = document.createElement('td');
  if (day.highlight) {
    element.classList.add('current-day');
  }
  if (currentHour === hour && day.highlight) {
    element.classList.add('current-time');
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions();
  element.innerHTML = `<ul style="list-style-type: none">${day.events
    .filter((e) => e.start.toZonedDateTime(timeZone).hour === hour)
    .map((e) => {
      const duration = e.end.since(e.start).total('minutes');
      const height = Math.min(100, (duration / 60) * 100);
      const insetTop = (e.start.toZonedDateTime(timeZone).minute / 60) * 100;
      const color = e.calendar?.color;
      return `<li
          style="background-color: ${color}; height: ${height}%; inset: ${insetTop}% 0 0 0; position: relative;"
        >${e.summary}
        </li>`;
    })
    .join('')}</ul>`;
  return element.outerHTML;
}
