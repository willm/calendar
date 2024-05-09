import {connect} from './event-db';
import {Temporal} from '@js-temporal/polyfill';
import type {Calendar, RemoteCalendar} from './model';
import api from './api';
import {calendarService} from './actions/calendar-service';
import {getCalendar} from './get-calendar';
import {deepEqual} from './deep-equal';
import {next, previous} from './week-navigation';

interface AppState {
  refreshingCalendars: boolean;
  addingCalendar: boolean;
  calendar: Calendar | undefined;
  errorMessage: string | undefined;
  weekIncluding: Temporal.ZonedDateTime;
}

const events = [
  'refreshingCalendars',
  'addingCalendar',
  'calendar',
  'errorMessage',
] as const;

function makeHandler(bus: HTMLDivElement): ProxyHandler<AppState> {
  return {
    set(state: AppState, key: keyof AppState, value) {
      if (key === 'refreshingCalendars') {
        state[key] = value;
        bus.dispatchEvent(
          new CustomEvent('refreshingCalendars', {detail: value})
        );
      }
      if (key === 'errorMessage') {
        state[key] = value;
        bus.dispatchEvent(new CustomEvent('errorMessage', {detail: value}));
      }
      if (key === 'addingCalendar') {
        state[key] = value;
        bus.dispatchEvent(new CustomEvent('addingCalendar', {detail: value}));
      }
      if (key === 'calendar' && !deepEqual(state[key], value)) {
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

    const search = new URLSearchParams(window.location.search);
    const weekIncludingParam = search.get('wi');
    let weekIncluding: Temporal.ZonedDateTime;
    weekIncluding = Temporal.Now.zonedDateTimeISO();
    if (weekIncludingParam) {
      try {
        weekIncluding = Temporal.Instant.from(
          weekIncludingParam!
        ).toZonedDateTimeISO('UTC');
      } catch (error) {
        console.error(error);
        weekIncluding = Temporal.Now.zonedDateTimeISO();
      }
    }

    this.#state = new Proxy(
      {
        refreshingCalendars: false,
        addingCalendar: false,
        calendar: undefined,
        errorMessage: undefined,
        weekIncluding,
      },
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
    try {
      const db = await connect();
      const calendars = await db.getCalendars();
      await Promise.all(
        calendars.map(async (calendar: RemoteCalendar) => {
          await calendarService(api, db).addCalendar(calendar.url, calendar);
        })
      );
    } catch (err) {
      console.error(err);
      this.setErrorMessage((err as Error).message);
    } finally {
      this.#state.refreshingCalendars = false;
    }
  }

  public async addCalendar(link: string, calendar: RemoteCalendar) {
    this.#state.addingCalendar = true;
    try {
      const db = await connect();
      db.saveCalendar(calendar);
      await calendarService(api, db).addCalendar(link, calendar);
    } catch (err) {
      this.#state.addingCalendar = false;
      console.error(err);
      this.setErrorMessage((err as Error).message);
      return;
    }
    this.#state.addingCalendar = false;
  }

  public async getCalendar() {
    const store = await connect();
    this.#state.calendar = await getCalendar(
      store,
      this.#state.weekIncluding,
      Temporal.Now.instant(),
      Intl.DateTimeFormat().resolvedOptions()
    );
  }

  public setErrorMessage(message: string | undefined) {
    this.#state.errorMessage = message;
  }

  get nextWeek(): string {
    return next(this.#state.weekIncluding);
  }

  get previousWeek(): string {
    return previous(this.#state.weekIncluding);
  }
}
