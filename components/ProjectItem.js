class ProjectItem extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div class="position-tab">
      <div class="flex-cols">
        <h4 class="title"></h4>
      </div>
      <div class="tech-stack"></div>
      <div>
        <small class="desc"></small>
      </div>
    </div>
    `;
  }


  render(data) {
    const title = this.querySelector(".title")
    title.innerHTML = `<a target="_blank" rel="noopener" href="${data.url}">${data.title}</a>`;

    const techStack = this.querySelector(".tech-stack");
    for (const item of data.techStack) {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.innerHTML = item;
      techStack.append(pill);
    }

    this.querySelector(".desc").innerHTML = data.desc

    return this;
  }
}

customElements.define('project-item', ProjectItem)