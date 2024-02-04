import {connect} from './event-db';
import {Temporal} from '@js-temporal/polyfill';
import type {Calendar, RemoteCalendar, SerialisedEvent} from './model';
import * as api from './api';
import {addCalendar} from './actions/add-calendar';
import {getCalendar} from './get-calendar';

interface AppState {
  refreshingCalendars: boolean;
  addingCalendar: boolean;
  calendar: Calendar | undefined;
}

const events = ['refreshingCalendars', 'addingCalendar', 'calendar'] as const;

function makeHandler(bus: HTMLDivElement): ProxyHandler<AppState> {
  return {
    set(state: AppState, key: keyof AppState, value) {
      if (key === 'refreshingCalendars') {
        state[key] = value;
        bus.dispatchEvent(
          new CustomEvent('refreshingCalendars', {detail: value})
        );
      }
      if (key === 'addingCalendar') {
        state[key] = value;
        bus.dispatchEvent(new CustomEvent('addingCalendar', {detail: value}));
      }
      if (key === 'calendar') {
        state[key] = value;
        bus.dispatchEvent(new CustomEvent('calendar', {detail: value}));
      }
      return true;
    },
  };
}

export class App {
  private static app: App | undefined;
  #bus: HTMLDivElement;
  #state: AppState;
  private constructor() {
    this.#bus = document.createElement('div');
    this.#state = new Proxy(
      {refreshingCalendars: false, addingCalendar: false, calendar: undefined},
      makeHandler(this.#bus)
    );
  }

  public on(
    event: (typeof events)[number],
    handler: (evt: Event) => void
  ): void {
    this.#bus.addEventListener(event, handler);
  }

  public static get(): App {
    if (App.app === undefined) {
      App.app = new App();
    }
    return App.app;
  }

  public async refreshCalendars() {
    this.#state.refreshingCalendars = true;
    const db = await connect();
    const calendars = await db.getCalendars();
    await Promise.all(
      calendars.map(async (c: RemoteCalendar) => {
        const icalData = await api.addCalendar(c.url);
        return await Promise.all(
          icalData.events.map((e: SerialisedEvent) => {
            e.calendarId = c.uid;
            return db.saveEvent(e);
          })
        );
      })
    );
    this.#state.refreshingCalendars = false;
  }

  public async addCalendar(link: string, calendar: RemoteCalendar) {
    this.#state.addingCalendar = true;
    await addCalendar(link, calendar);
    this.#state.addingCalendar = false;
  }

  public async getCalendar() {
    const store = await connect();
    this.#state.calendar = await getCalendar(
      store,
      Temporal.Now.plainDateTimeISO()
    );
  }
}