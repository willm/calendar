import type {CellData} from '../lib/model';

export function cell(cellData: CellData): string {
  const rowspan = cellData.rowSpan;

  const element = document.createElement('td');
  element.classList.add(...cellData.classes);
  element.setAttribute('rowspan', rowspan.toString());

  element.innerHTML = `<ul style="list-style-type: none">${cellData.events
    .map((event) => {
      return `<li
          style="background-color: ${event.color}; height: ${event.height}%; inset: ${event.insetTop}% 0 0 0; position: relative;"
        >${event.summary}
        </li>`;
    })
    .join('')}</ul>`;
  return element.outerHTML;
}
