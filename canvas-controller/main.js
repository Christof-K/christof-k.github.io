import {cursorComputeAndDraw} from "./cursor.js"
import ParticleBg from "./particles.js";


const wrapperDOM = document.getElementById("wrapper");
if (!wrapperDOM) {
  throw new Error("renderElement#canvas-container not found");
}

const cursorCanvas = document.getElementById("cursor");
if (!cursorCanvas) throw new Error("#cursor canvas not found");
const cursorCanvasContext = cursorCanvas.getContext("2d");
if (!cursorCanvasContext) throw new Error("cursorCanvas context is null");

const bgCanvas = document.getElementById("bg");
if (!bgCanvas) throw new Error("#bg canvas not found");
const bgCtx = bgCanvas.getContext("2d");
if (!bgCtx) throw new Error("bg canvas context is null");


const resizeCanvas = () => {
  const WIDTH = wrapperDOM.clientWidth;
  const HEIGHT = wrapperDOM.clientHeight;

  cursorCanvas.width = WIDTH;
  cursorCanvas.height = HEIGHT;

  bgCanvas.width = WIDTH;
  bgCanvas.height = HEIGHT;
};
resizeCanvas();

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
  offsetX: wrapperDOM?.offsetLeft ?? 0,
  offsetY: wrapperDOM?.offsetTop ?? 0
};

const particle = new ParticleBg(bgCtx, bgCanvas, mouse);

(function animate() {
  cursorComputeAndDraw(mouse, cursorCanvasContext, cursorCanvas);
  particle.animationFrameLoop();

  window.requestAnimationFrame(animate);
})();



// ~~~~~~~~~ EVENTS ~~~~~~~~~
window.addEventListener("resize", resizeCanvas);

const mouseXYUpdate = (x,y) => {
  mouse.x = x - mouse.offsetX;
  mouse.y = y - mouse.offsetY;
}

window.addEventListener("mousemove", (event) => {
  if (mouse.hovering === null) {
    mouseXYUpdate(event.clientX, event.clientY);
  }
});

document.addEventListener("mousedown", (event) => {
  if (!mouse.hovering) {
    mouseXYUpdate(event.clientX, event.clientY);
  }
  mouse.isDown = true;
  // particles.forEach(mainLoop)
});

document.addEventListener("mouseup", (event) => {
  if (!mouse.hovering) {
    mouseXYUpdate(event.clientX, event.clientY);
  }
  mouse.isDown = false;
  // particles.forEach(mainLoop) // todo:
});

document.addEventListener("mouseover", (event) => {
  const target = event.target;
  if (target.tagName === "A" && target.className.indexOf("active") === -1) {
    mouse.hovering = target;
  } else {
    mouse.hovering = null;
  }
});
