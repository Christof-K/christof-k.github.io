import HelloWorldPath from "./canvas-hello-world.js";

const renderElement = document.getElementById("wrapper");
if (!renderElement) throw new Error("renderElement#canvas-container not found");

const blue = [25, 133, 161];
let WIDTH = renderElement.clientWidth;
let HEIGHT = renderElement.clientHeight;
const MARGIN = 100;

const bgCanvas = document.getElementById("bg");
const ctx = bgCanvas.getContext("2d");
bgCanvas.width = WIDTH;
bgCanvas.height = HEIGHT;

const lerp = (from, to, acc) => {
  return from + acc * (to - from);
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const clampValue = (value, from, to) => {
  return Math.min(Math.max(value, from), to);
};

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
  frozenUntil = 0;
  acc = 0.05;
  floatMode = false;

  constructor(x, y) {
    // this.x = getRandomInt(0 - MARGIN, WIDTH + MARGIN);
    // this.y = getRandomInt(0 - MARGIN, HEIGHT + MARGIN);
    this.x = x;
    this.y = y;
    this.r = 3;
    // this.frozenUntil = Date.now() + getRandomInt(1000, 2000);
    this.floatMode = true;
    this.dest_r = this.r

    this.poke();
  }

  set acceleration(val) {
    this.acc = val;
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
    if (getRandomInt(0, 9000) === 0 && !this.floatMode) {
      this.specialUntil = Date.now() + 3000;
    }
    const red = [255, 0, 0];
    if (this.isSpecial()) return `rgb(${red.join(",")})`;

    // const black = [0, 0, 0];
    // const hm = this.r; // / CamZ;
    return `rgb(${blue[0]}, ${blue[1]}, ${blue[2]})`;
  }

  poke() {
    const pokeVal = this.floatMode ? 20 : 200;

    this.dest_x = clampValue(
      this.x + getRandomInt(pokeVal * -1, pokeVal),
      0 - MARGIN,
      WIDTH + MARGIN
    );
    this.dest_y = clampValue(
      this.y + getRandomInt(pokeVal * -1, pokeVal),
      0 - MARGIN,
      HEIGHT + MARGIN
    );
  }

  changeSize() {
    if (!this.floatMode) {
      this.dest_r = getRandomInt(this.min_r, this.max_r);
    }
  }

  frameMoveCompute() {
    if (this.frozenUntil > Date.now()) {
      return;
    }

    if (!this.isMoving()) {
      this.poke();
    }

    if (!this.isResising()) {
      if (getRandomInt(0, 100) === 0) {
        this.changeSize();
      }
    }

    this.x = lerp(this.x, this.dest_x, this.acc);
    this.y = lerp(this.y, this.dest_y, this.acc);
    this.r = lerp(this.r, this.dest_r, this.acc);
  }

  frameDraw() {
    this.frameMoveCompute();

    ctx.beginPath();
    ctx.fillStyle = this.getColor();
    ctx.lineWidth = 2;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();

    // console.log('--', [this.x, this.y], [this.dest_x, this.dest_y])
  }
}

const particles = [];

const pixelScan = () => {
  const vpix = 3;
  const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
  for (let y = 0; y < HEIGHT; y += vpix) {
    for (let x = 0; x < WIDTH; x += vpix) {
      const index = (y * WIDTH + x) * 4;
      const alpha = pixels[index + 3];
      if (alpha > 0) {
        particles.push(new Particle(x, y));
      }
    }
  }
};

let init = false;

(function animate() {
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  if (!init) {
    const hw_path_org = HelloWorldPath();
    const hw_path = new Path2D();
    const matrix = new DOMMatrix();
    const scale = WIDTH / 2000;
    matrix.translateSelf(
      WIDTH / 2 - (1500 / 2) * scale,
      HEIGHT / 2 - (350 / 2) * scale
    );
    matrix.scaleSelf(scale);
    hw_path.addPath(hw_path_org, matrix);

    ctx.fillStyle = "rgb(25, 133, 161)";
    ctx.fill(hw_path);

    pixelScan();
    init = true;

    setTimeout(() => {
      for (const p of particles) {
        p.acceleration = 0.01;
        p.floatMode = false;
      }
    }, 3000);
  }

  for (const p of particles) {
    p.frameDraw();
  }

  window.requestAnimationFrame(animate);
})();
