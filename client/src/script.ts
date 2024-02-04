import './components/header/header';
import {renderCalendar} from './lib/calendar-view';
import {getCalendar} from './lib/get-calendar';
import {connect} from './lib/event-db';
import {Temporal} from '@js-temporal/polyfill';
import {deepEqual} from './lib/deep-equal';

async function main() {
  const store = await connect();
  let calendar = await getCalendar(store, Temporal.Now.plainDateTimeISO());
  renderCalendar(calendar);
  setInterval(async () => {
    const update = await getCalendar(store, Temporal.Now.plainDateTimeISO());
    if (!deepEqual(calendar, update)) {
      renderCalendar(update);
      calendar = update;
    }
  }, 10000);
}

main();
