const icons: Record<string, string> = {
  refresh: `<svg
    class="icon"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#ffffff"
  >
    <path
      d="M21 12C21 16.9706 16.9706 21 12 21C9.69494 21 7.59227 20.1334 6 18.7083L3 16M3 12C3 7.02944 7.02944 3 12 3C14.3051 3 16.4077 3.86656 18 5.29168L21 8M3 21V16M3 16H8M21 3V8M21 8H16"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
</svg>`,
};

class Icon extends HTMLElement {
  static observeredAttibutes = ['type'];
  constructor() {
    super();
  }

  connectedCallback() {
    const attr = this.getAttribute('type');
    if (attr) {
      console.log(attr);
    }
    const shadowRoot = this.attachShadow({mode: 'open'});
    const element = document.createElement('span');
    element.innerHTML = attr && icons[attr] ? icons[attr]! : '';
    shadowRoot.appendChild(element);
  }
}
customElements.define('cal-icon', Icon);
