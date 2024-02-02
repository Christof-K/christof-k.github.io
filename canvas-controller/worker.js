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
      console.log("---", e.data.width, e.data.height);
      canvas = new OffscreenCanvas(e.data.width, e.data.height);
      controllerInstance = new Controller(canvas, e.data.mouse);
      animate();
      break;
    case "resizeCanvas":
      console.log("resizeCanvas", e.data.width, e.data.height);
      canvas.width = e.data.width;
      canvas.height = e.data.height;
      break;
    case "mouseUpdate":
      controllerInstance.updateMouse(e.data.mouse);
      break;
  }
};

const animate = () => {
  self.postMessage({
    msg: "render",
    bitmap: controllerInstance.animationFrame(),
  });
  self.requestAnimationFrame(animate);
};
