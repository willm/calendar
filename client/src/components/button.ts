class Button extends HTMLElement {
  static observedAttributes = ['size', 'id', 'type'];

  connectedCallback() {
    const template = document.getElementById('button') as HTMLTemplateElement;
    const templateContent = template.content;

    const shadowRoot = this.attachShadow({mode: 'open'});
    const element = templateContent.cloneNode(true);

    shadowRoot.appendChild(element);
    const id = this.getAttribute('id') || '';
    const size = this.getAttribute('size') || 'large';
    const type = this.getAttribute('type') || 'button';
    const button = shadowRoot.querySelector('button')!;
    button.setAttribute('id', id!);
    button.setAttribute('tyep', type!);
    button.classList.add(`button__${size}`);
  }
}
customElements.define('cal-button', Button);
