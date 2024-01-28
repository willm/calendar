export interface Events {
  events: Event[];
}

export interface Event {
  uid: string;
  summary: string;
  timestamp: number;
  start: string;
  end: string;
}

interface WeekDay {
  highlight: boolean;
  name: string;
  hours: Hour[];
}

interface Hour {
  highlight: boolean;
  name: string;
}

export interface Calendar {
  weekDays: WeekDay[];
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  year: number;
}
