import {Temporal} from '@js-temporal/polyfill';

export interface RemoteCalendar {
  uid: string;
  name: string;
  color: string;
  url: string;
}

export type CalendarResponse = Record<
  string,
  {summary: string; start: Date; end: Date; rrule?: string}
>;

export interface APIEvent {
  uid: string;
  summary: string;
  timestamp: number;
  start: string;
  end: string;
  calendarId: string;
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
  events: Event[];
}

export interface Calendar {
  weekDays: WeekDay[];
  dayOfWeek: string;
  dayOfMonth: number;
  hour: number;
  month: string;
  year: number;
}
