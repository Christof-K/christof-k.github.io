class JobPosition extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="position-tab">
        <div class="flex-cols">
          <h4 class="flex-1 title">
          </h4>
          <div class="date-period"></div>
        </div>
        <div class="tech-stack">
        </div>
        <ul class="desc-list">
        </ul>
      </div>
    `;
  }

  render(data) {
    this.querySelector("h4.title").innerHTML = `${data.title} <small>${data.subtitle}</small>`;
    this.querySelector(".date-period").innerHTML = data.datePeriod;

    const techStack = this.querySelector(".tech-stack")
    for (const item of data.techStack) {
      const pill = document.createElement("span");
      pill.className = "pill"
      pill.innerHTML = item;
      techStack.append(pill)
    }

    const descList = this.querySelector("ul.desc-list");
    for (const item of data.descList) {
      const li = document.createElement("li");
      li.innerHTML = item;
      descList.append(li)
    }

    return this;
  }

}


customElements.define("job-position", JobPosition)