import createCustomButton from '../buttons/button.js'
import buttonList from '../buttons/buttonStyle.js'
async function navFactory() {
    let navBar = document.querySelectorAll("custom-nav");
    let navB = navBar[navBar.length - 1];
    let slots = navB.shadowRoot.querySelectorAll('slot');

    let tagContainer = navB.shadowRoot.querySelectorAll('.tagContainer');
    let tags = [];
    for (let s of slots) {
        tags.push(s.name);

    }

    tagContainer[0].style.flexGrow = 1;
    tagContainer[1].style.flexGrow = 3;
    tagContainer[2].style.flexGrow = 0.75;
    let span;
    for (let k of tags) {
        let n = Number(k.slice(3));
        let type = "span";
        let imageSourceV = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptNy43NTMgMTguMzA1Yy0uMjYxLS41ODYtLjc4OS0uOTkxLTEuODcxLTEuMjQxLTIuMjkzLS41MjktNC40MjgtLjk5My0zLjM5My0yLjk0NSAzLjE0NS01Ljk0Mi44MzMtOS4xMTktMi40ODktOS4xMTktMy4zODggMC01LjY0NCAzLjI5OS0yLjQ4OSA5LjExOSAxLjA2NiAxLjk2NC0xLjE0OCAyLjQyNy0zLjM5MyAyLjk0NS0xLjA4NC4yNS0xLjYwOC42NTgtMS44NjcgMS4yNDYtMS40MDUtMS43MjMtMi4yNTEtMy45MTktMi4yNTEtNi4zMSAwLTUuNTE0IDQuNDg2LTEwIDEwLTEwczEwIDQuNDg2IDEwIDEwYzAgMi4zODktLjg0NSA0LjU4My0yLjI0NyA2LjMwNXoiLz48L3N2Zz4=';
        if (n == 7) {
            type = "custom-button"
            imageSourceV = buttonList['profile'];
            span = createCustomButton(imageSourceV);
        } else if (n == 5) {
            type = "custom-button"
            imageSourceV = buttonList['bell'];
            span = createCustomButton(imageSourceV);
        } else {
            span = document.createElement(type);
        }
        span.slot = k;
        span.imageSource = imageSourceV;

        if (slots[n - 1].dataset.content !== 'svg') {
            span.textContent = (slots[n - 1].dataset.content);
        }

        navB.appendChild(span);
    }
}

export default class navigatorBar extends HTMLElement {
    constructor() {
        super();
        let navi = document.querySelector(".navTemplate");
        let navShadow = navi.content.cloneNode(true);
        this.attachShadow({ mode: "open" }).appendChild(navShadow);
    }
    async connectedCallback() {
        await navFactory();
    }
}
//let customElementRegistry = window.customElements;
//customElementRegistry.define("custom-nav", navigatorBar);
/* customElementRegistry.define("custom-button", customButton); */

