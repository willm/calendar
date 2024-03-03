import './alert';
import './header/header';
import './icon';
import './calendar';

class App extends HTMLElement {
  connectedCallback() {
    const element = document.createElement('div');
    element.innerHTML = `
      <cal-alert></cal-alert>
      <cal-header></cal-header>
      <cal-calendar></cal-calendar>`;
    this.appendChild(element);
  }
}
customElements.define('cal-app', App);
