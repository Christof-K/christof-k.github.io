import * as THREE from 'three';
import { Vector3 } from 'three';
import { cursorCompute, cursorDraw } from './cursor';

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
  interpolationVal: number
}

const mouse: IMouse = {
  x: -100,
  y: -100,
  radius: 10,
  sizeXY: [10, 10],
  hovering: null,
  isDown: false,
  targetRadius: null,
  targetXY: null,
  targetSizeXY: null,
  interpolationVal: 1
}

interface IParticle {
  mesh: THREE.Mesh,
  targetPosition: Vector3,
  material: THREE.MeshBasicMaterial
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

for (let i = 0; i < THREE.MathUtils.clamp((WIDTH * HEIGHT / 100), 500, 4000); i++) {
  const x = THREE.MathUtils.randInt(bw * -1, bw)
  const y = THREE.MathUtils.randInt(bh * -1, bh)
  const z = THREE.MathUtils.randInt(1, ParticleMaxZ)
  const geometry = new THREE.SphereGeometry(1, 6, 6);
  const material = new THREE.MeshBasicMaterial({ color: getHeightColor(z) })
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

function getHeightColor(zValue: number): THREE.Color {

  const globalModifier = mouse.isDown ? 0.56 : 0.86
  const colorVal = (zValue / CamZ) + globalModifier
  const redModifier = 0;
  const greenModifier = 0.6;
  const blueModifier = 0.5;
  return new THREE.Color(
    1 - colorVal + redModifier,
    1 - colorVal + greenModifier,
    1 - colorVal + blueModifier
  )
}


function mainLoop(particle: IParticle) {

  const meshVec3 = particle.mesh.position.clone();
  const newVec3 = particle.targetPosition.clone();

  // circle around cursor
  // const cursorRadius = 60;
  // const toCursorDistance = new THREE.Vector2(meshVec3.x, meshVec3.y).distanceTo(mouseVec)

  // if (toCursorDistance < cursorRadius) {
  //   const angle = Math.atan2(meshVec3.y - mouseVec.x, meshVec3.x - mouseVec.y);
  //   newVec3.setX(mouseVec.x + cursorRadius * Math.cos(angle))
  //   newVec3.setY(mouseVec.y + cursorRadius * Math.sin(angle))
  // }

  if (Math.abs(meshVec3.z - particle.targetPosition.z) < 30) {
    newVec3.setZ(THREE.MathUtils.randInt(1, ParticleMaxZ));
  }

  particle.targetPosition = newVec3.clone();
  particle.material.color = getHeightColor(meshVec3.z);


  // assign
  const targetVec3 = particle.targetPosition;
  const newIVec3 = new THREE.Vector3();
  newIVec3.setX(THREE.MathUtils.lerp(meshVec3.x, targetVec3.x, 0.9));
  newIVec3.setY(THREE.MathUtils.lerp(meshVec3.y, targetVec3.y, 0.9));
  newIVec3.setZ(THREE.MathUtils.lerp(meshVec3.z, targetVec3.z, mouse.isDown ? 0.0001 : 0.001));
  particle.mesh.position.copy(newIVec3);
}



(function animate() {

  camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mouseVec.x / 600), 0.06)
  camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (mouseVec.y / 600), 0.06)

  particles.forEach(mainLoop);
  renderer.render(scene, camera)

  // cursor animation
  cursorCompute(mouse);
  cursorDraw(mouse, cursorCanvasContext, cursorCanvas)

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
  particles.forEach(mainLoop)
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.isDown = true;
})

document.addEventListener("mouseup", (event) => {
  particles.forEach(mainLoop)
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.isDown = false;
})


document.addEventListener("mouseover", (event) => {
  const target = event.target as HTMLTextAreaElement;
  if (target.tagName === 'A') {
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