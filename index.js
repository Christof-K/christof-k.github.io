import State from "./state.js";
import canvasInit from './canvas-controller/main.js';

const bodyContent = document.getElementById("body-content");

const tabs = {
  home: {
    nav: "Home",
    url: "/#home",
    id: "home",
  },
  projects: {
    nav: "Projects",
    url: "/#projects",
    id: "projects",
  },
  jobPositions: {
    nav: "Positions",
    url: "/#job-positions",
    id: "job-positions",
  },
  contactForm: {
    nav: "Contact form",
    url: "https://forms.gle/M7x7sXqhqxN697oN8",
    id: "contact-form",
  },
};



const state = new State();


// ~~~~~~~~~ DOM manipulation ~~~~~~~~~

const hashChange = () => {
  const hash = window.location.hash.substring(1);
  state.activeTab = hash === "" ? tabs.home.id : hash;


  const icon_container = document.getElementById("icon-container");
  if (icon_container) {
    if (hash !== "home" && hash !== "") {
      icon_container.className = `${icon_container.className} hidden-mobile`;
    } else {
      icon_container.className = icon_container.className
        .split("hidden-mobile")
        .join("");
    }
  }
};
hashChange();

fetch("/data.json")
  .then((res) => res.json())
  .then((data) => {
    const jobPositions = bodyContent.querySelector(".tab.job-positions");
    for (const item of data.positions) {
      const jp = new JobPosition();
      jobPositions.append(jp.render(item));
    }

    const projecs = bodyContent.querySelector(".tab.projects");
    for (const item of data.projects) {
      const p = new ProjectItem();
      projecs.append(p.render(item));
    }
  });

const scrollWrapper = bodyContent.querySelector(".scroll-wrapper");
const navLinks = document.getElementById("nav-links");

for (const _tab of Object.values(tabs)) {
  const navLink = new NavLink();
  navLink.render(_tab.id, _tab.nav, _tab.url, state);
  navLinks.append(navLink)

  const tabComp = new Tab();
  tabComp.render(_tab.id, state);
  scrollWrapper.append(tabComp);
}

const tabHome = scrollWrapper.querySelector(".tab.home");
tabHome.innerHTML = `
  I am a <special>dedicated</special> enthusiast of web
  applications, with a fervor for crafting
  <special>exceptional</special> user interfaces and experiences.
`;

window.addEventListener("load", () => {
  canvasInit().then(() => {
    const ls = document.getElementById("loading-screen");
    if (ls) {
      ls.remove();
    }
    const wrapper = document.getElementById("wrapper");
    if (wrapper) {
      wrapper.className = "blur-out";
    }
  });
});

window.addEventListener("hashchange", hashChange);