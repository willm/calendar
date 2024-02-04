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
  plus: `<svg
    class="icon"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#ffffff"
    fill="ffffff"
  >
    <path
      stroke-width="1.5"
      d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H11V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H13V3Z"
    />
  </svg>`,
  close: ` <svg
    viewBox="0 -0.5 21 21"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>close [#1511]</title>
    <defs></defs>
    <g
      id="Page-1"
      stroke="none"
      stroke-width="1"
      fill="none"
      fill-rule="evenodd"
    >
      <g
        id="Dribbble-Light-Preview"
        transform="translate(-419.000000, -240.000000)"
        fill="currentColor"
      >
        <g id="icons" transform="translate(56.000000, 160.000000)">
          <polygon
            id="close-[#1511]"
            points="375.0183 90 384 98.554 382.48065 100 373.5 91.446 364.5183 100 363 98.554 371.98065 90 363 81.446 364.5183 80 373.5 88.554 382.48065 80 384 81.446"
          ></polygon>
        </g>
      </g>
    </g>
  </svg>`,
};

class Icon extends HTMLElement {
  static observeredAttibutes = ['type'];
  constructor() {
    super();
  }

  connectedCallback() {
    const attr = this.getAttribute('type');
    const shadowRoot = this.attachShadow({mode: 'open'});
    const element = document.createElement('span');
    element.innerHTML = attr && icons[attr] ? icons[attr]! : '';
    shadowRoot.appendChild(element);
  }
}
customElements.define('cal-icon', Icon);