import {Temporal} from '@js-temporal/polyfill';

export interface Events {
  events: Event[];
}

export interface SerialisedEvent {
  uid: string;
  summary: string;
  timestamp: number;
  start: string;
  end: string;
}

export interface Event {
  uid: string;
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

interface Hour {
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
