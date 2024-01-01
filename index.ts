import * as THREE from 'three';
import { Vector3 } from 'three';
import { cursorComputeAndDraw } from './cursor.js';


const renderElement = document.getElementById("wrapper");
if (!renderElement) throw new Error("renderElement#canvas-container not found");

let WIDTH = renderElement.clientWidth
let HEIGHT = renderElement.clientHeight

const cursorCanvas = <HTMLCanvasElement>document.getElementById("cursor");
if (!cursorCanvas) throw new Error("#cursor canvas not found")
const cursorCanvasContext = cursorCanvas.getContext("2d");
if (!cursorCanvasContext) throw new Error('cursorCanvas context is null')
cursorCanvas.width = WIDTH;
cursorCanvas.height = HEIGHT;


export interface IMouse {
  x: number
  y: number
  radius: number
  hovering: HTMLTextAreaElement | null
  isDown: boolean
  targetXY: [number, number] | null
  sizeXY: [number, number]
  targetSizeXY: [number, number] | null
  targetRadius: number | null
}

const mouse: IMouse = {
  x: -100,
  y: -100,
  radius: 50,
  sizeXY: [10, 10],
  hovering: null,
  isDown: false,
  targetRadius: null,
  targetXY: null,
  targetSizeXY: null,
}

interface IParticle {
  mesh: THREE.Mesh,
  targetPosition: Vector3,
  material: THREE.MeshBasicMaterial
  specialUntil?: number
}

let mouseVec = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1);

renderer.setSize(WIDTH, HEIGHT);
renderElement.appendChild(renderer.domElement);

const ParticleMaxZ = 200;
const CamZ = ParticleMaxZ + (ParticleMaxZ / 10);
const particles: Array<IParticle> = [];
const bw = WIDTH / 8
const bh = HEIGHT / 8

for (let i = 0; i < THREE.MathUtils.clamp((WIDTH * HEIGHT / 400), 500, 4000); i++) {
  const x = THREE.MathUtils.randInt(bw * -1, bw)
  const y = THREE.MathUtils.randInt(bh * -1, bh)
  const z = THREE.MathUtils.randInt(1, ParticleMaxZ)
  const geometry = new THREE.SphereGeometry(0.2, 4, 4);
  const material = new THREE.MeshBasicMaterial({ color: getHeightColor(z, false) })
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z)
  particles.push({
    mesh: mesh,
    targetPosition: mesh.position,
    material: material
  });
  scene.add(mesh);
}

camera.position.set(0, 0, CamZ)


function getHeightColor(zValue: number, isSpecial: boolean): THREE.Color {

  const C_blue = new THREE.Color(25 / 255, 133 / 255, 151 / 255);
  const C_black = new THREE.Color(0, 0, 0);
  const C_red = new THREE.Color(1, 0, 0);

  const hm = (zValue / CamZ);

  let resultColor = C_blue.lerp(C_black, hm)
  if (isSpecial) resultColor = C_red;
  return resultColor
}



function mainLoop(particle: IParticle) {

  const meshVec3 = particle.mesh.position.clone();
  const newVec3 = particle.targetPosition.clone();
  if (Math.abs(meshVec3.z - particle.targetPosition.z) < 30) {
    newVec3.setZ(THREE.MathUtils.randInt(1, ParticleMaxZ));
  }

  particle.targetPosition = newVec3.clone();

  if (THREE.MathUtils.randInt(0, 10000) === 0) {
    particle.specialUntil = Date.now() + 3000
  }

  particle.material.color = getHeightColor(meshVec3.z, (particle?.specialUntil ?? 0) > Date.now());

  // assign
  const targetVec3 = particle.targetPosition;
  const newIVec3 = new THREE.Vector3();
  newIVec3.setX(THREE.MathUtils.lerp(meshVec3.x, targetVec3.x, 0.9));
  newIVec3.setY(THREE.MathUtils.lerp(meshVec3.y, targetVec3.y, 0.9));
  newIVec3.setZ(THREE.MathUtils.lerp(meshVec3.z, targetVec3.z, 0.001));
  particle.mesh.position.copy(newIVec3);
}



(function animate() {

  camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mouseVec.x / 600), 0.06)
  camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (mouseVec.y / 600), 0.06)

  particles.forEach(mainLoop);
  renderer.render(scene, camera)

  // cursor animation
  cursorComputeAndDraw(mouse, cursorCanvasContext, cursorCanvas);
  requestAnimationFrame(animate)
})();


// ~~~~~~~~~ EVENTS ~~~~~~~~~
window.addEventListener("mousemove", (event) => {
  if (mouse.hovering === null) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouseVec.setX((mouse.x - WIDTH / 2) / 18);
    mouseVec.setY(((mouse.y - HEIGHT / 2) * -1) / 17);
  }
})

document.addEventListener("mousedown", (event) => {
  if (!mouse.hovering) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }
  mouse.isDown = true;
  particles.forEach(mainLoop)

})

document.addEventListener("mouseup", (event) => {
  if (!mouse.hovering) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }
  mouse.isDown = false;
  particles.forEach(mainLoop)
})


document.addEventListener("mouseover", (event) => {
  const target = event.target as HTMLTextAreaElement;
  if (target.tagName === 'A' && target.className.indexOf('active') === -1) {
    mouse.hovering = target;
  } else {
    mouse.hovering = null;
  }
})

window.addEventListener("resize", (event) => {
  WIDTH = renderElement.clientWidth;
  HEIGHT = renderElement.clientHeight;
  renderer.setSize(WIDTH, HEIGHT);
})

const hashChange = () => {
  const hash = window.location.hash.substring(1);


  const elmTab = document.querySelector(`.tab-${hash}:not(.active)`);
  if (elmTab) {
    const oldActiveElms = document.querySelectorAll(".active");
    if (oldActiveElms.length > 0) {
      oldActiveElms.forEach(oldActiveElm => {
        oldActiveElm.className = oldActiveElm.className.split('active').join('');
      })
    }

    elmTab.className = `${elmTab.className} active`;
    const elmNav = document.querySelector(`.nav-link-${hash}:not(.active)`);
    if (elmNav) {
      elmNav.className = `${elmNav.className} active`;
    }

  }

  const icon_container = document.getElementById('icon-container');
  if (icon_container) {
    if (hash !== "home" && hash !== "") {
      icon_container.className = `${icon_container.className} hidden-mobile`
    } else {
      icon_container.className = icon_container.className.split('hidden-mobile').join('');
    }
  }
}
window.addEventListener("hashchange", hashChange);
hashChange();


window.addEventListener("load", () => {
  const ls = document.getElementById("loading-screen");
  if(ls) {
    ls.remove()
  }
  const wrapper = document.getElementById("wrapper");
  if(wrapper) {
    wrapper.className = "blur-out"
  }
})