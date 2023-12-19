import * as THREE from 'three';
import { Vector3 } from 'three';

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


let mouseVec = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1);
let mousedown = false;

renderer.setSize(WIDTH, HEIGHT);
renderElement.appendChild(renderer.domElement);

const ParticleMaxZ = 200;
const CamZ = ParticleMaxZ + (ParticleMaxZ / 10);


interface IParticle {
  mesh: THREE.Mesh,
  targetPosition: Vector3,
  material: THREE.MeshBasicMaterial
}

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

// cursor red dot
// const geometry = new THREE.SphereGeometry(1, 6, 6);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const cursorSphere = new THREE.Mesh(geometry, material);
// cursorSphere.position.z = CamZ - 50;
// scene.add(cursorSphere)

// let lastSwarmUpdateTime = 0;

function getHeightColor(zValue: number): THREE.Color {

  const globalModifier = mousedown ? 0.56 : 0.86
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
  newIVec3.setZ(THREE.MathUtils.lerp(meshVec3.z, targetVec3.z, mousedown ? 0.0001 : 0.001));
  particle.mesh.position.copy(newIVec3);
}



(function animate() {

  camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mouseVec.x / 600), 0.06)
  camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (mouseVec.y / 600), 0.06)

  particles.forEach(mainLoop);

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
})()


document.addEventListener("mousemove", (event) => {
  mouseVec.setX((event.clientX - WIDTH / 2) / 18);
  mouseVec.setY(((event.clientY - HEIGHT / 2) * -1) / 17);
  // cursorSphere.position.x = mouseVec.x
  // cursorSphere.position.y = mouseVec.y
  cursorDraw(event.offsetX, event.offsetY, mousedown)

})

const cursorDraw = (x: number,y :number, _mousedown = false) => {
  cursorCanvasContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  cursorCanvasContext.beginPath();
  cursorCanvasContext.arc(x, y, 8, 0, 2 * Math.PI);
  if (_mousedown) cursorCanvasContext.fill()
  cursorCanvasContext.stroke();
}



document.addEventListener("mousedown", (event) => {
  mousedown = true;
  particles.forEach(mainLoop)
  cursorDraw(event.offsetX, event.offsetY, true);
})

document.addEventListener("mouseup", (event) => {
  mousedown = false;
  particles.forEach(mainLoop)
  cursorDraw(event.offsetX, event.offsetY, false);
})

window.addEventListener("resize", (event) => {
  WIDTH = renderElement.clientWidth;
  HEIGHT = renderElement.clientHeight;

  renderer.setSize(WIDTH, HEIGHT);


})