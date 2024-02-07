import { lerp, getRandomInt, clampValue } from "./helper.js";

const MARGIN = 100;
const blue = [25, 133, 161];
const red = [255, 0, 0];

class ParticleController {
  acceleration = 0.0;
  floatMode = false;
  canvasWidth = 0;
  canvasHeight = 0;

  constructor(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}

class Particle {
  x = 0;
  y = 0;

  x_force = undefined;
  y_force = undefined;
  force_acc = 0.5;

  r = 0;

  dest_x = 0;
  dest_y = 0;
  dest_r = 0;

  min_r = 1;
  max_r = 3;

  specialUntil = 0;
  acc = 0.05;

  constructor(x, y, mouse, controller) {
    this.x = x;
    this.y = y;

    this.r = 2;
    this.dest_r = this.r;

    this.mouse = mouse;
    this.controller = controller;

    this.poke();
  }

  isSpecial() {
    return this.specialUntil > Date.now() || this.isForceMoving();
  }

  isMoving() {
    return Math.abs(this.x - this.dest_x) + Math.abs(this.y - this.dest_y) > 50;
  }

  isForceMoving() {
    if (Math.abs(this.x - this.x_force) + Math.abs(this.y - this.y_force) < 5) {
      this.x_force = undefined;
      this.y_force = undefined;
    }
    return this.x_force != undefined || this.y_force != undefined;
  }

  isResising() {
    return Math.abs(this.r - this.dest_r) > 1;
  }

  poke() {
    const pokeValX =
      (this.controller.floatMode ? 3 : 50) *
      (this.controller.canvasWidth / 500);
    const pokeValY =
      (this.controller.floatMode ? 3 : 50) *
      (this.controller.canvasHeight / 500);

    this.dest_x = clampValue(
      this.x + getRandomInt(-pokeValX, pokeValX),
      0 - MARGIN,
      this.controller.canvasWidth + MARGIN
    );
    this.dest_y = clampValue(
      this.y + getRandomInt(-pokeValY, pokeValY),
      0 - MARGIN,
      this.controller.canvasHeight + MARGIN
    );
  }

  changeSize() {
    if (!this.controller.floatMode) {
      this.dest_r = getRandomInt(this.min_r, this.max_r);
    }
  }

  checkDangerZone() {
    if (this.mouse.hovering) return;

    // check danger zone
    const dx = this.mouse.x - this.x;
    const dy = this.mouse.y - this.y;
    const angle = Math.atan2(dy, dx);

    // circle pointer
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = this.mouse.radius * 4 * Math.random();
    if (distance < radius) {
      this.x_force = this.x - radius * Math.cos(angle);
      this.y_force = this.y - radius * Math.sin(angle);
    }
  }

  nextStep() {
    if (getRandomInt(0, 20000) === 0 && !this.controller.floatMode) {
      this.specialUntil = Date.now() + 3000;
    }

    this.acc = lerp(this.acc, this.controller.acceleration, 0.01);

    if (!this.isResising()) {
      if (getRandomInt(0, 100) === 0) {
        this.changeSize();
      }
    }

    if (this.isForceMoving()) {
      this.x = lerp(this.x, this.x_force, this.force_acc);
      this.y = lerp(this.y, this.y_force, this.force_acc);
    } else {
      if (!this.isMoving()) {
        this.poke();
      }

      this.x = lerp(this.x, this.dest_x, this.acc);
      this.y = lerp(this.y, this.dest_y, this.acc);
      this.r = lerp(this.r, this.dest_r, this.acc);

      this.checkDangerZone();
    }
  }

  appendToPath(path) {
    this.nextStep();
    path.moveTo(this.x, this.y);
    path.arc(this.x, this.y, this.r, 0, Math.PI * 2);
  }
}

class ParticleBg {
  init = false;
  particles = [];
  texts = ["Hello World"];

  constructor(canvas, mouse) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.mouse = mouse;

    this.controller = new ParticleController();
    this.controller.canvasHeight = this.canvas.width;
    this.controller.canvasWidth = this.canvas.height;
  }


  onCanvasResize() {
    this.controller.canvasHeight = this.canvas.height;
    this.controller.canvasWidth = this.canvas.width;
  }

  _init() {
    this.init = true;

    this.controller.acceleration = 0.01;
    this.controller.floatMode = true;

    setTimeout(() => {
      this.controller.acceleration = 0.01;
      this.controller.floatMode = false;
    }, 3000);

    setTimeout(() => {
      this.controller.acceleration = 0.01;
    }, 6000);

    // generate text
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.ctx.font = `bold ${this.canvas.width / 10}px arial`;
    this.ctx.fillText(
      this.texts[getRandomInt(0, this.texts.length)],
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    const data32 = new Uint32Array(
      this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      ).data.buffer
    );

    for (let i = 0; i < data32.length; i++) {
      if (data32[i] & 0xff000000) {
        if (i % parseInt(this.canvas.width / 200) === 0) {
          const x = parseInt(i % this.canvas.width);
          const y = parseInt(i / this.canvas.width);
          this.particles.push(new Particle(x, y, this.mouse, this.controller));
        }
      }
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animationFrameLoop() {
    if (!this.init) {
      this._init();
    }

    const specialParticles = new Path2D();
    const regularParticles = new Path2D();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (
        this.controller.floatMode ||
        p.isSpecial() ||
        i % getRandomInt(0, 2) === 0
      ) {
        p.appendToPath(p.isSpecial() ? specialParticles : regularParticles);
      }
    }

    this.ctx.beginPath();

    this.ctx.fillStyle = `rgba(${blue.join(",")}, 0.4)`;
    this.ctx.fill(regularParticles);

    this.ctx.fillStyle = `rgba(${red.join(",")}, 0.6)`;
    this.ctx.fill(specialParticles);
  }
}

export default ParticleBg;
