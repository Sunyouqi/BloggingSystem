

function logoConstruct(logo) {
    let logoTemp = document.querySelector('.logoTemp');

    let logoContent = logoTemp.content;
    logo.appendChild(logoContent.cloneNode(true));

}

export default class webLogo extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {

        logoConstruct(this);
    }

}

let customElementsRegistry = window.customElements;

customElementsRegistry.define("web-logo", webLogo);
