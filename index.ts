import * as THREE from 'three';
import { Vector3 } from 'three';


let mouseVec = new THREE.Vector2();
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1);
let mousedown = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ParticleMaxZ = 500;
const CamZ = ParticleMaxZ + 200;


interface IParticle {
  mesh: THREE.Mesh,
  targetPosition: Vector3,
  material: THREE.MeshBasicMaterial
}

const particles: Array<IParticle> = [];

const bw = window.innerWidth / 4
const bh = window.innerHeight / 4

for (let i = 0; i < 9000; i++) {
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
const geometry = new THREE.SphereGeometry(1, 6, 6);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cursorSphere = new THREE.Mesh(geometry, material);
cursorSphere.position.z = CamZ - 50;
scene.add(cursorSphere)

// let lastSwarmUpdateTime = 0;

function getHeightColor(zValue: number): THREE.Color {

  const globalModifier = mousedown ? 0.76 : 0.86
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
  const newVec3 = meshVec3.clone();

  if (mousedown) {
    // circle around cursor
    // const cursorRadius = 60;
    // const toCursorDistance = new THREE.Vector2(meshVec3.x, meshVec3.y).distanceTo(mouseVec)

    // if (toCursorDistance < cursorRadius) {
    //   const angle = Math.atan2(meshVec3.y - mouseVec.x, meshVec3.x - mouseVec.y);
    //   newVec3.setX(mouseVec.x + cursorRadius * Math.cos(angle))
    //   newVec3.setY(mouseVec.y + cursorRadius * Math.sin(angle))
    // }
  } else if (meshVec3.distanceTo(meshVec3.clone().setZ(particle.targetPosition.z)) < 20) {
    newVec3.setZ(THREE.MathUtils.randInt(1, ParticleMaxZ));
  }


  particle.material.color = getHeightColor(meshVec3.z);
  particle.targetPosition = newVec3.clone();
}



(function animate() {

  camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mouseVec.x / 1000), 0.06)
  camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (mouseVec.y / 1000), 0.06)

  particles.forEach((particle) => {
    const meshVec3 = particle.mesh.position;
    const targetVec3 = particle.targetPosition;
    const newIVec3 = new THREE.Vector3();
    newIVec3.setX(THREE.MathUtils.lerp(meshVec3.x, targetVec3.x, 0.9));
    newIVec3.setY(THREE.MathUtils.lerp(meshVec3.y, targetVec3.y, 0.9));
    newIVec3.setZ(THREE.MathUtils.lerp(meshVec3.z, targetVec3.z, 0.0005));
    particle.mesh.position.copy(newIVec3);
  })

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
})()

setInterval(() => {
  particles.forEach(mainLoop)
}, 100)

document.addEventListener("mousemove", (event) => {
  mouseVec.setX((event.clientX - window.innerWidth / 2) / 18);
  mouseVec.setY(((event.clientY - window.innerHeight / 2) * -1) / 17);
  cursorSphere.position.x = mouseVec.x
  cursorSphere.position.y = mouseVec.y
})


document.addEventListener("mousedown", (event) => {
  mousedown = true;
  particles.forEach(mainLoop)
})

document.addEventListener("mouseup", (event) => {
  mousedown = false;
  particles.forEach(mainLoop)
})