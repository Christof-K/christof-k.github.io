import { cursorComputeAndDraw } from "./cursor.js";
import State from "./state.js";

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

const mouse = {
  x: -100,
  y: -100,
  radius: 50,
  sizeXY: [10, 10],
  hovering: null,
  isDown: false,
  targetRadius: null,
  targetXY: null,
  targetSizeXY: null,
};

const state = new State();


const cursorCanvas = document.getElementById("cursor");
if (!cursorCanvas) throw new Error("#cursor canvas not found")
const cursorCanvasContext = cursorCanvas.getContext("2d");
if (!cursorCanvasContext) throw new Error('cursorCanvas context is null')
const renderElement = document.getElementById("wrapper");
let WIDTH = renderElement.clientWidth;
let HEIGHT = renderElement.clientHeight;

cursorCanvas.width = WIDTH;
cursorCanvas.height = HEIGHT;


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
  const ls = document.getElementById("loading-screen");
  if (ls) {
    ls.remove();
  }
  const wrapper = document.getElementById("wrapper");
  if (wrapper) {
    wrapper.className = "blur-out";
  }
});


// ~~~~~~~~~ Three.js & canvas logic ~~~~~~~~~

// let mouseVec = [0,0];

// renderer.setSize(WIDTH, HEIGHT);
// renderElement.appendChild(renderer.domElement);

// const ParticleMaxZ = 200;
// const CamZ = ParticleMaxZ + ParticleMaxZ / 10;
// const particles = [];
// const bw = WIDTH / 8;
// const bh = HEIGHT / 8;

// for (
//   let i = 0;
//   i < THREE.MathUtils.clamp((WIDTH * HEIGHT) / 400, 500, 4000);
//   i++
// ) {
//   const x = THREE.MathUtils.randInt(bw * -1, bw);
//   const y = THREE.MathUtils.randInt(bh * -1, bh);
//   const z = THREE.MathUtils.randInt(1, ParticleMaxZ);
//   const geometry = new THREE.SphereGeometry(0.2, 4, 4);
//   const material = new THREE.MeshBasicMaterial({
//     color: getHeightColor(z, false),
//   });
//   const mesh = new THREE.Mesh(geometry, material);
//   mesh.position.set(x, y, z);
//   particles.push({
//     mesh: mesh,
//     targetPosition: mesh.position,
//     material: material,
//   });
//   scene.add(mesh);
// }

// camera.position.set(0, 0, CamZ);

// function getHeightColor(zValue, isSpecial) {
//   const C_blue = new THREE.Color(25 / 255, 133 / 255, 151 / 255);
//   const C_black = new THREE.Color(0, 0, 0);
//   const C_red = new THREE.Color(1, 0, 0);

//   const hm = zValue / CamZ;

//   let resultColor = C_blue.lerp(C_black, hm);
//   if (isSpecial) resultColor = C_red;
//   return resultColor;
// }

// function mainLoop(particle) {
//   const meshVec3 = particle.mesh.position.clone();
//   const newVec3 = particle.targetPosition.clone();
//   if (Math.abs(meshVec3.z - particle.targetPosition.z) < 30) {
//     newVec3.setZ(THREE.MathUtils.randInt(1, ParticleMaxZ));
//   }

//   particle.targetPosition = newVec3.clone();

//   if (THREE.MathUtils.randInt(0, 10000) === 0) {
//     particle.specialUntil = Date.now() + 3000;
//   }

//   particle.material.color = getHeightColor(
//     meshVec3.z,
//     (particle?.specialUntil ?? 0) > Date.now()
//   );

  // assign
//   const targetVec3 = particle.targetPosition;
//   const newIVec3 = new THREE.Vector3();
//   newIVec3.setX(THREE.MathUtils.lerp(meshVec3.x, targetVec3.x, 0.9));
//   newIVec3.setY(THREE.MathUtils.lerp(meshVec3.y, targetVec3.y, 0.9));
//   newIVec3.setZ(THREE.MathUtils.lerp(meshVec3.z, targetVec3.z, 0.001));
//   particle.mesh.position.copy(newIVec3);
// }

// (function animate() {
//   camera.rotation.y = THREE.MathUtils.lerp(
//     camera.rotation.y,
//     mouseVec.x / 600,
//     0.06
//   );
//   camera.rotation.x = THREE.MathUtils.lerp(
//     camera.rotation.x,
//     mouseVec.y / 600,
//     0.06
//   );

//   particles.forEach(mainLoop);
//   renderer.render(scene, camera);

//   // cursor animation
//   cursorComputeAndDraw(mouse, cursorCanvasContext, cursorCanvas);
//   requestAnimationFrame(animate);
// })();



// ~~~~~~~~~ EVENTS ~~~~~~~~~
window.addEventListener("mousemove", (event) => {
  if (mouse.hovering === null) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // todo:
    // mouseVec.setX((mouse.x - WIDTH / 2) / 18);
    // mouseVec.setY(((mouse.y - HEIGHT / 2) * -1) / 17);
  }
})

document.addEventListener("mousedown", (event) => {
  if (!mouse.hovering) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }
  mouse.isDown = true;
  // particles.forEach(mainLoop)

})

document.addEventListener("mouseup", (event) => {
  if (!mouse.hovering) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }
  mouse.isDown = false;
  // particles.forEach(mainLoop) // todo:
})


document.addEventListener("mouseover", (event) => {
  const target = event.target;
  if (target.tagName === 'A' && target.className.indexOf('active') === -1) {
    mouse.hovering = target;
  } else {
    mouse.hovering = null;
  }
})


// todo:
// window.addEventListener("resize", (event) => {
//   WIDTH = renderElement.clientWidth;
//   HEIGHT = renderElement.clientHeight;
//   renderer.setSize(WIDTH, HEIGHT);
// })

window.addEventListener("hashchange", hashChange);