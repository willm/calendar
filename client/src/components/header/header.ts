import {Calendar, RemoteCalendar} from '../../lib/model';
import {App} from '../../lib/app-state';
import '../icon';

const loader = '<div class="loader"/>';

function refreshButton(app: App, doc: HTMLElement) {
  const button = doc.querySelector('#refresh-button');
  button?.addEventListener('click', () => {
    app.refreshCalendars();
  });
  app.on('refreshingCalendars', (evt: Event) => {
    const value: boolean = (evt as CustomEvent).detail;
    button!.innerHTML = value ? loader : '<cal-icon type="refresh"></cal-icon>';
  });
}

function registerAddCalendarButton(app: App, doc: HTMLElement) {
  const dialog = doc.querySelector('#add-calendar-modal') as HTMLDialogElement;
  const closeButton = doc.querySelector('#close-calendar-modal');
  const addCalButton = doc.querySelector('#add-calendar-button');
  const submitCalButton = doc.querySelector('#add-calendar-submit-button');
  app.on('addingCalendar', (evt) => {
    const isAdding = (evt as CustomEvent).detail as boolean;
    submitCalButton!.innerHTML = isAdding ? loader : 'Add';
    if (!isAdding) {
      dialog.close();
    }
  });
  const linkInput = doc.querySelector('#ical-link') as HTMLInputElement;
  closeButton?.addEventListener('click', () => dialog?.close());
  addCalButton?.addEventListener('click', () => {
    dialog?.showModal();
    linkInput.focus();
  });

  const form = doc.querySelector('#add-calendar-form') as HTMLFormElement;
  form?.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const link = linkInput?.value;
    const name = (doc.querySelector('#calendar-name') as HTMLInputElement)
      ?.value;
    const color = (doc.querySelector('#calendar-color') as HTMLInputElement)
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
  }

  connectedCallback() {
    const template = document.getElementById('header') as HTMLTemplateElement;
    const templateContent = template.content;

    const element = templateContent.cloneNode(true);

    this.appendChild(element);
    const app = App.get();
    refreshButton(app, this);
    registerAddCalendarButton(app, this);

    const nextWeekLink = this.querySelector('#next-week');
    nextWeekLink?.setAttribute('href', `/?wi=${app.nextWeek}`);

    const previousWeekLink = this.querySelector('#previous-week');
    previousWeekLink?.setAttribute('href', `/?wi=${app.previousWeek}`);

    app.on('calendar', (evt) => {
      const calendar = (evt as CustomEvent).detail as Calendar;
      const heading = this.querySelector('h1');
      heading!.innerText = `${calendar.month} ${calendar.year}`;
    });
  }
}

customElements.define('cal-header', HeaderElement);
