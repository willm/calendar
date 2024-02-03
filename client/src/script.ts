import './components/header/header';
import {renderCalendar} from './lib/calendar-view.js';
import {getCalendar} from './lib/get-calendar.js';
import {connect} from './lib/event-db.js';
import {Temporal} from '@js-temporal/polyfill';

async function main() {
  const store = await connect();
  renderCalendar(await getCalendar(store, Temporal.Now.plainDateTimeISO()));
  setInterval(
    async () =>
      renderCalendar(await getCalendar(store, Temporal.Now.plainDateTimeISO())),
    300000
  );
}

main();
