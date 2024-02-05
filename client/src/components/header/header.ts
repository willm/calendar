import {Calendar, RemoteCalendar} from '../../lib/model';
import {App} from '../../lib/app-state';
import '../icon';

const loader = '<div class="loader"/>';

function refreshButton(app: App, doc: ShadowRoot) {
  const button = doc.getElementById('refresh-button');
  button?.addEventListener('click', () => {
    app.refreshCalendars();
  });
  app.on('refreshingCalendars', (evt: Event) => {
    const value: boolean = (evt as CustomEvent).detail;
    button!.innerHTML = value ? loader : '<cal-icon type="refresh"></cal-icon>';
  });
}

function registerAddCalendarButton(app: App, doc: ShadowRoot) {
  const dialog = doc.getElementById('add-calendar-modal') as HTMLDialogElement;
  const closeButton = doc.getElementById('close-calendar-modal');
  const addCalButton = doc.getElementById('add-calendar-button');
  const submitCalButton = doc.getElementById('add-calendar-submit-button');
  app.on('addingCalendar', (evt) => {
    const isAdding = (evt as CustomEvent).detail as boolean;
    submitCalButton!.innerHTML = isAdding ? loader : 'Add';
    if (!isAdding) {
      dialog.close();
    }
  });
  const linkInput = doc.getElementById('ical-link') as HTMLInputElement;
  closeButton?.addEventListener('click', () => dialog?.close());
  addCalButton?.addEventListener('click', () => {
    dialog?.showModal();
    linkInput.focus();
  });

  const form = doc.getElementById('add-calendar-form') as HTMLFormElement;
  form?.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const link = linkInput?.value;
    const name = (doc.getElementById('calendar-name') as HTMLInputElement)
      ?.value;
    const color = (doc.getElementById('calendar-color') as HTMLInputElement)
      ?.value;
    const calendar: RemoteCalendar = {
      uid: crypto.randomUUID().toString(),
      name: name,
      color: color,
      url: link,
    };
    app.addCalendar(link, calendar);
  });
}

class HeaderElement extends HTMLElement {
  static observeredAttibutes = ['title'];

  constructor() {
    super();
    const template = document.getElementById('header') as HTMLTemplateElement;
    const templateContent = template.content;

    const shadowRoot = this.attachShadow({mode: 'open'});
    const element = templateContent.cloneNode(true);

    shadowRoot.appendChild(element);
  }

  connectedCallback() {
    const app = App.get();
    refreshButton(app, this.shadowRoot!);
    registerAddCalendarButton(app, this.shadowRoot!);
    app.on('calendar', (evt) => {
      const calendar = (evt as CustomEvent).detail as Calendar;
      const heading = this.shadowRoot!.querySelector('h1');
      heading!.innerText = `${calendar.month} ${calendar.year}`;
    });
  }
}

customElements.define('cal-header', HeaderElement);
