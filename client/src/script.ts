import './components/header/header';
import './components/icon';
import {renderCalendar} from './lib/calendar-view';
import {getCalendar} from './lib/get-calendar';
import {connect} from './lib/event-db';
import {Temporal} from '@js-temporal/polyfill';
import {deepEqual} from './lib/deep-equal';
import {App} from './lib/app-state';

async function main() {
  const app = App.get();
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
