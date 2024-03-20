import './components/app';
import {App} from './lib/app-state';

async function main() {
  const app = App.get();

  app.refreshCalendars();
  app.getCalendar();

  setInterval(app.getCalendar.bind(app), 10000);
  setInterval(app.refreshCalendars.bind(app), 300000);
}

main();
