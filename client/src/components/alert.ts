import {App} from '../lib/app-state';
import './icon';

class Alert extends HTMLElement {
  static observedAttributes = ['type', 'message'];

  connectedCallback() {
    const msgText = this.getAttribute('message');
    if (!msgText) {
      this.setAttribute('style', 'visibility:hidden');
    }

    const element = document.createElement('output');
    const msg = document.createElement('span');
    msg.textContent = msgText;
    msg.setAttribute('id', 'error-message');
    this.classList.add('alert__error');

    const button = document.createElement('cal-button');
    button.setAttribute('size', 'medium');
    button.addEventListener('click', () => App.get().setErrorMessage(''));
    button.innerHTML = `<cal-icon type="close"></cal-icon>`;

    element.appendChild(msg);
    element.appendChild(button);
    this.appendChild(element);
    App.get().on('errorMessage', (evt) => {
      const text = (evt as CustomEvent).detail as string;
      console.log('got err', text, this);
      this.setAttribute('message', text);
    });
  }
  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'message') {
      const el = this.querySelector('#error-message');
      this.setAttribute(
        'style',
        newValue ? 'visibility: visible' : 'visibility:hidden'
      );

      el!.textContent = newValue;
    }
  }
}
customElements.define('cal-alert', Alert);
