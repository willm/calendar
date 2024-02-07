import './components/app';
import {App} from './lib/app-state';

async function main() {
  const app = App.get();
  app.getCalendar();
  setInterval(() => {
    app.getCalendar();
  }, 10000);
}

main();
