import * as THREE from 'three';
import { getRandomIntRanged } from './helpers';
import { Vector3 } from 'three';
const mouse = {
    x: 0,
    y: 0
};
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const ParticleShiftAmount = 200;
const ParticleMaxZ = 500;
const cubes = [];
for (let i = 0; i < 20000; i++) {
    const x = getRandomIntRanged(-1100, 1100);
    const y = getRandomIntRanged(-1100, 1100);
    const z = getRandomIntRanged(1, ParticleMaxZ);
    const geometry = new THREE.SphereGeometry(1, 6, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    cubes.push({
        cube: cube,
        goalPosition: cube.position,
        material: material
    });
    scene.add(cube);
}
camera.position.set(0, 0, 500);
// let lastSwarmUpdateTime = 0;
function animate() {
    const mx = mouse.x - window.innerWidth / 2;
    const my = mouse.y - window.innerHeight / 2;
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, (mx / 4000), 0.1);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, (my / 4000), 0.05);
    cubes.forEach((val, i) => {
        const cpx = val.cube.position.x;
        const cpy = val.cube.position.y;
        const cpz = val.cube.position.z;
        // if (val.cube.position.distanceTo(val.goalPosition) < 20) {
        if (Math.abs(val.cube.position.z - val.goalPosition.z) < 20) {
            const shift = ParticleShiftAmount;
            const newX = getRandomIntRanged(cpx - shift, cpx + shift);
            const newY = getRandomIntRanged(cpy - shift, cpy + shift);
            let newZ = getRandomIntRanged(cpz - shift, cpz + shift);
            if (newZ > ParticleMaxZ)
                newZ = ParticleMaxZ;
            const newVec = new Vector3(newX, newY, newZ);
            val.goalPosition = newVec;
        }
        const gpv = val.goalPosition;
        const colorVal = gpv.z * 100 / ParticleMaxZ / 100;
        val.material.color = new THREE.Color(1 - colorVal, colorVal - 0.50, colorVal + 0.2);
        // val.cube.position.x = THREE.MathUtils.lerp(cpx, gpv.x, 0.01);
        // val.cube.position.y = THREE.MathUtils.lerp(cpy, gpv.y, 0.01);
        val.cube.position.z = THREE.MathUtils.lerp(cpz, gpv.z, 0.01);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});
