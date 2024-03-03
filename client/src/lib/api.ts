import {CalendarResponse} from './model';
import ical from 'ical';

export interface API {
  getCalendar(link: string): Promise<CalendarResponse>;
}

async function getCalendar(link: string): Promise<CalendarResponse> {
  const url = new URL(link);
  const res = await fetch('http://localhost:8080' + url.pathname, {
    headers: {
      'x-target-host': url.host,
    },
  });
  const icsText = await res.text();
  const iCallBody = ical.parseICS(icsText);
  return iCallBody;
}

const api: API = {getCalendar};
export default api;
