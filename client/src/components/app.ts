class App extends HTMLElement {
  connectedCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const element = document.createElement('div');
    element.innerHTML = `<cal-header></cal-header><cal-calendar></cal-calendar>`;
    shadowRoot.appendChild(element);
  }
}
customElements.define('cal-app', App);
