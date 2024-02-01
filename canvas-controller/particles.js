import HelloWorldPath from "./hello-world-path.js";
import { lerp, getRandomInt, clampValue } from "./helper.js";

const MARGIN = 100;
const blue = [25, 133, 161];

class Particle {
  x = 0;
  y = 0;
  r = 0;

  dest_x = 0;
  dest_y = 0;
  dest_r = 0;

  min_r = 1;
  max_r = 3;

  specialUntil = 0;
  acc = 0.05;
  acc_dist = 0.05;

  floatMode = false;

  constructor(x, y, canvas, ctx) {
    this.x = x;
    this.y = y;
    this.r = 2;
    this.floatMode = true;
    this.dest_r = this.r;

    this.canvas = canvas;
    this.ctx = ctx;

    this.poke();
  }

  set acceleration(val) {
    this.acc_dist = val;
  }

  set floatMode(val) {
    this.floatMode = val;
  }

  isSpecial() {
    return this.specialUntil > Date.now();
  }

  isMoving() {
    return Math.abs(this.x - this.dest_x) + Math.abs(this.y - this.dest_y) > 50;
  }
  isResising() {
    return Math.abs(this.r - this.dest_r) > 1;
  }

  getColor() {
    if (getRandomInt(0, 20000) === 0 && !this.floatMode) {
      this.specialUntil = Date.now() + 3000;
    }
    const red = [255, 0, 0];
    if (this.isSpecial()) return `rgb(${red.join(",")})`;

    // const black = [0, 0, 0];
    // const hm = this.r; // / CamZ;
    return `rgb(${blue[0]}, ${blue[1]}, ${blue[2]})`;
  }

  poke() {
    const pokeValX = (this.floatMode ? 3 : 50) * (this.canvas.width / 800);
    const pokeValY = (this.floatMode ? 3 : 50) * (this.canvas.height / 800);

    this.dest_x = clampValue(
      this.x + getRandomInt(pokeValX * -1, pokeValX),
      0 - MARGIN,
      this.canvas.width + MARGIN
    );
    this.dest_y = clampValue(
      this.y + getRandomInt(pokeValY * -1, pokeValY),
      0 - MARGIN,
      this.canvas.height + MARGIN
    );
  }

  changeSize() {
    if (!this.floatMode) {
      this.dest_r = getRandomInt(this.min_r, this.max_r);
    }
  }

  frameMoveCompute() {
    if (!this.isMoving()) {
      this.poke();
    }

    if (!this.isResising()) {
      if (getRandomInt(0, 100) === 0) {
        this.changeSize();
      }
    }

    this.acc = lerp(this.acc, this.acc_dist, 0.01);

    this.x = lerp(this.x, this.dest_x, this.acc);
    this.y = lerp(this.y, this.dest_y, this.acc);
    this.r = lerp(this.r, this.dest_r, this.acc);
  }

  frameDraw() {
    this.frameMoveCompute();

    this.ctx.beginPath();
    this.ctx.fillStyle = this.getColor();
    this.ctx.lineWidth = 2;
    this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.ctx.fill();
  }
}




class ParticleBg {
  init = false;
  textVisible = true;
  particles = []


  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  set height(val) {
    this.height = val;
  }

  set width(val) {
    this.width = val;
  }

  pixelScan = () => {
    const vpix = 3;
    const pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.width).data;
    for (let y = 0; y < this.canvas.height; y += vpix) {
      for (let x = 0; x < this.canvas.width; x += vpix) {
        const index = (y * this.canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha > 0) {
          this.particles.push(new Particle(x, y, this.canvas, this.ctx));
        }
      }
    }
  };

  animationFrameLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.textVisible) {
      const hw_path_org = HelloWorldPath();
      const hw_path = new Path2D();
      const matrix = new DOMMatrix();
      const scale = this.canvas.width / 2000;
      matrix.translateSelf(
        this.canvas.width / 2 - (1500 / 2) * scale,
        this.canvas.height / 2 - (350 / 2) * scale
      );
      matrix.scaleSelf(scale);
      hw_path.addPath(hw_path_org, matrix);

      this.ctx.fillStyle = "rgb(25, 133, 161)";
      this.ctx.strokeStyle = "rgb(25, 133, 161)";
      if (!this.init) {
        this.ctx.fill(hw_path);
      } else if (this.canvas.width < 1000) {
        this.ctx.stroke(hw_path);
      }
    }

    if (!this.init) {
      this.pixelScan();
      this.init = true;

      setTimeout(() => {
        for (const p of this.particles) {
          p.acceleration = 0.01;
          p.floatMode = false;
        }
        this.textVisible = false;
        setTimeout(() => {
          for (const p of this.particles) {
            p.acceleration = 0.005;
          }
        }, 3000);
      }, 3000);
    }

    for (const p of this.particles) {
      p.frameDraw();
    }
  }
}

export default ParticleBg;
