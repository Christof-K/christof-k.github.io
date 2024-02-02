import { lerp } from "./helper.js";

class Cursor {
  #x = 0;
  #y = 0;

  radius = 50;
  sizeXY = [10, 10];

  constructor(canvas, mouse) {
    this.mouse = mouse;
    this.ctx = canvas.getContext("2d");

    this.radius = null;
    this.sizeXY = [10, 10];

    this.targetRadius = null;
    this.targetXY = null;
    this.targetSizeXY = null;
  }

  cursorDraw() {
    const x = this.#x;
    const y = this.#y;

    if (x < 0 || y < 0) return;
    const [X, Y] = [0, 1];
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.roundRect(x, y, this.sizeXY[X], this.sizeXY[Y], this.radius);
    if (this.mouse.isDown) this.ctx.fill();
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  animationFrameLoop() {
    let [interpolationSize, interpolationRadious, interpolationPos] = [1, 1, 1];

    if (this.mouse.hovering) {
      const targetBoundingRect = this.mouse.hovering;
      interpolationSize = interpolationPos = 0.5;
      interpolationRadious = 0.2;
      this.targetRadius = 0;

      this.targetXY = [
        targetBoundingRect.x - this.mouse.wrapperOffsetX - 8,
        targetBoundingRect.y - this.mouse.wrapperOffsetY - 4,
      ];
      this.targetSizeXY = [
        targetBoundingRect.width + 16,
        targetBoundingRect.height + 8,
      ];
    } else {
      this.targetRadius = 50;
      this.targetSizeXY = [10, 10];
      this.targetXY = null;
      this.#x = this.mouse.x;
      this.#y = this.mouse.y;
    }
    const [X, Y] = [0, 1];
    if (this.targetXY !== null) {
      this.#x = lerp(this.#x, this.targetXY[X], interpolationPos);
      this.#y = lerp(this.#y, this.targetXY[Y], interpolationPos);
    }
    if (this.targetRadius !== null) {
      this.radius = lerp(this.radius, this.targetRadius, interpolationRadious);
    }
    if (this.targetSizeXY !== null) {
      this.sizeXY = [
        lerp(this.sizeXY[X], this.targetSizeXY[X], interpolationSize),
        lerp(this.sizeXY[Y], this.targetSizeXY[Y], interpolationSize),
      ];
    }

    this.cursorDraw();
  }
}

export default Cursor;
