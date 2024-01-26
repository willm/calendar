import Handlebars from 'handlebars';

const table = Handlebars.compile(`
      <table>
        <thead>
          <tr>
            <th />
            {{#each weekDays}}
              <th {{#if this.highlight}}class="current-day"{{/if}}>
                <h2>{{this.name}}</h2>
              </th>
            {{/each}}
          </tr>
        </thead>
        <tbody>
          {{#each hours}}
            <tr>
              <td>{{this.name}}</td>
              {{#each ../weekDays}}
                <td {{#if this.highlight}}class="current-day{{#if ../highlight}} current-time{{/if}}"{{/if}}></td>
              {{/each}}
            </tr>
          {{/each}}
        </tbody>
      </table>
`);

export function renderCalendar(data) {
  document.querySelector('main')?.remove();
  const el = document.createElement('main');
  el.innerHTML = table(data);
  document.body.appendChild(el);
}
