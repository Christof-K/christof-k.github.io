const template = document.createElement("template");
template.innerHTML = `
  <style>
    span {
      color: var(--primary-color);
      font-family: Raleway;
      font-size: 4.5em;
    }
    span:hover {
      color: transparent;
      -webkit-text-stroke: 2px black;
    }
  </style>
`;

class Header extends HTMLElement {
  constructor() {
    super();

    const letters = this.innerText.split("");
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));

    const arr = [];
    for (const letter of letters) {
      if (letter === " ") shadow.append(letter);
      else {
        const elm = document.createElement("span");
        elm.innerText = letter;
        shadow.append(elm);
      }
    }
  }
  connectedCallback() {
    console.log("name header component connected");
  }
}

customElements.define("name-header", Header);
