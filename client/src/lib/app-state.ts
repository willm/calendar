import {connect} from './event-db';
import type {RemoteCalendar, SerialisedEvent} from './model';
import * as api from './api';

interface AppState {
  refreshingCalendars: boolean;
}

const events = ['refreshingCalendars'] as const;

function makeHandler(bus: HTMLDivElement): ProxyHandler<AppState> {
  return {
    set(state: AppState, key: keyof AppState, value) {
      if (key === 'refreshingCalendars') {
        state[key] = value;
        bus.dispatchEvent(
          new CustomEvent('refreshingCalendars', {detail: value})
        );
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
      {refreshingCalendars: false},
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
}
