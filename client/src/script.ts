import './components/header/header';
import './components/icon';
import './components/calendar';
import './components/app';
import {App} from './lib/app-state';

async function main() {
  const app = App.get();
  app.getCalendar();
  setInterval(() => {
    app.getCalendar();
  }, 100000);
}

main();
