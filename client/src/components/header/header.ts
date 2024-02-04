import {addCalendar} from '../../lib/actions/add-calendar';
import {RemoteCalendar} from '../../lib/model';
import {App} from '../../lib/app-state';

function refreshButton(doc: ShadowRoot) {
  const app = App.get();
  const button = doc.getElementById('refresh-button');
  button?.addEventListener('click', () => {
    app.refreshCalendars();
  });
}

function registerAddCalendarButton(doc: ShadowRoot) {
  const dialog = doc.getElementById('add-calendar-modal') as HTMLDialogElement;
  console.log('dialog', dialog);
  const closeButton = doc.getElementById('close-calendar-modal');
  const addCalButton = doc.getElementById('add-calendar-button');
  const submitCalButton = doc.getElementById('add-calendar-submit-button');
  const linkInput = doc.getElementById('ical-link') as HTMLInputElement;
  closeButton?.addEventListener('click', () => dialog?.close());
  addCalButton?.addEventListener('click', () => {
    console.log('hello');
    dialog?.showModal();
    linkInput.focus();
  });

  const form = doc.getElementById('add-calendar-form') as HTMLFormElement;
  form?.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    submitCalButton!.innerHTML = '<div class="loader" />';
    const link = linkInput?.value;
    const name = (doc.getElementById('calendar-name') as HTMLInputElement)
      ?.value;
    const color = (doc.getElementById('calendar-color') as HTMLInputElement)
      ?.value;
    console.log(link);
    const calendar: RemoteCalendar = {
      uid: crypto.randomUUID().toString(),
      name: name,
      color: color,
      url: link,
    };
    try {
      await addCalendar(link, calendar);
      submitCalButton!.innerText = 'OK';
      dialog.close();
    } catch (err) {
      // todo: display error
      submitCalButton!.innerText = 'OK';
    }
  });
}

customElements.define(
  'cal-header',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('header') as HTMLTemplateElement;
      const templateContent = template.content;

      const shadowRoot = this.attachShadow({mode: 'open'});
      const element = templateContent.cloneNode(true);

      shadowRoot.appendChild(element);
    }

    connectedCallback() {
      refreshButton(this.shadowRoot!);
      const button = this.shadowRoot!.getElementById('refresh-button');
      App.get().on('refreshingCalendars', (evt: Event) => {
        const value: boolean = (evt as CustomEvent).detail;
        button!.innerHTML = value
          ? '<div class="loader" />'
          : '<cal-icon type="refresh" />';
      });
      registerAddCalendarButton(this.shadowRoot!);
    }
  }
);
