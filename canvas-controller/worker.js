import ParticleBg from "./particles.js";
import Cursor from "./cursor.js";

class Controller {
  constructor(canvas, mouse) {
    this.mouse = mouse;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particleBg = new ParticleBg(this.canvas, this.mouse);
    this.cursor = new Cursor(this.canvas, this.mouse);
  }

  updateMouse(mouse) {
    // keep reference
    for (const [key, value] of Object.entries(mouse)) {
      this.mouse[key] = value;
    }
  }

  animationFrame() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particleBg.animationFrameLoop();
    this.cursor.animationFrameLoop();

    return this.canvas.transferToImageBitmap();
  }
}

let controllerInstance;
let canvas;

self.onmessage = (e) => {
  switch (e.data.type) {
    case "init":
      canvas = new OffscreenCanvas(e.data.width, e.data.height);
      controllerInstance = new Controller(canvas, e.data.mouse);

      drawWithCallback(() => {
        self.postMessage({
          type: "init-handshake",
        });
      });

      break;
    case "resizeCanvas":
      canvas.width = e.data.width;
      canvas.height = e.data.height;
      break;
    case "mouseUpdate":
      controllerInstance.updateMouse(e.data.mouse);

      break;
  }
};

const fps = 45;
let interval = 1000 / fps;
let then;
let drawCallback;

const draw = (timestamp) => {
  self.requestAnimationFrame(draw);

  if (then === undefined) {
    then = timestamp;
  }

  const delta = timestamp - then;
  if (delta > interval) {
    self.postMessage({
      type: "render",
      bitmap: controllerInstance.animationFrame(),
    });

    then = timestamp - (delta % interval);

    if (drawCallback) {
      drawCallback();
      drawCallback = null;
    }
  }
};

const drawWithCallback = (cb) => {
  drawCallback = cb;
  draw();
};
