
export default function createCustomButton(imgSource) {
    class customButton extends HTMLElement {
        constructor(imgs = imgSource) {
            super();

            let butTemplate = document.querySelector('.buttonTemplate');
            let shadow = butTemplate.content.cloneNode(true);
            this.attachShadow({ mode: 'open' }).appendChild(shadow);
            this.imageSource = imgs;

        }
        connectedCallback() {

            let icon = document.createElement('img');
            icon.slot = "buttonImg";
            icon.src = this.imageSource;
            icon.style.height = "30px";
            icon.style.width = "30px";

            this.appendChild(icon);
            this.addEventListener("click", this.handleClick.bind(this));

            //detect screen size when loading the screen;
            // if screen is smaller than 600px resize
            document.addEventListener('DOMContentLoaded', this.handleButtonLowerSize.bind(this))
            //media query response to screen change.//
            // it shrinks the size of the icon to 15px/ 15px
            window.matchMedia('(min-width:605px)').addEventListener('change', this.handleButtonUpperSize.bind(this))
            window.matchMedia('(max-width:600px)').addEventListener('change', this.handleButtonLowerSize.bind(this))
        }

        handleClick(event) {
            console.log("in click event", event);
            window.location.href = "http://127.0.0.1:5500/ShadowRoot/index.html";
        }
        handleButtonUpperSize(event) {
            console.log("here")
            let upperBound = window.matchMedia('(min-width:605px');
            if (upperBound.matches) {
                let img = this.querySelector('img')

                img.style.height = "30px";
                img.style.width = "30px";
            }
        }
        handleButtonLowerSize(event) {
            console.log("here2")
            let media = window.matchMedia('(max-width:600px)');
            if (media.matches) {

                let img = this.querySelector('img')

                img.style.height = "15px";
                img.style.width = "15px";
            }
        }
    }
    let customElementRegistry = window.customElements;
    if (!customElementRegistry.get('custom-button')) {
        customElementRegistry.define("custom-button", customButton);
    }

    return document.createElement('custom-button');
}

