import {Temporal} from '@js-temporal/polyfill';

export interface RemoteCalendar {
  uid: string;
  name: string;
  color: string;
  url: string;
}

export interface Events {
  events: SerialisedEvent[];
}

export interface SerialisedEvent {
  uid: string;
  calendarId: string;
  summary: string;
  timestamp: number;
  start: string;
  end: string;
}

export interface Event {
  uid: string;
  calendar?: RemoteCalendar;
  summary: string;
  timestamp: number;
  start: Temporal.Instant;
  end: Temporal.Instant;
}

export interface WeekDay {
  highlight: boolean;
  name: string;
  hours: Hour[];
}

export interface Hour {
  highlight: boolean;
  events: Event[];
}

export interface Calendar {
  weekDays: WeekDay[];
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  year: number;
}
