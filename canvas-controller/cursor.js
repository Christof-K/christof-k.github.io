import { lerp } from "./helper.js";

class Cursor {
  constructor(canvas, mouse) {
    this.mouse = mouse;
    this.ctx = canvas.getContext("2d");
  }

  cursorDraw() {
    const x = this.mouse.x;
    const y = this.mouse.y;

    if (x < 0 || y < 0) return;
    const [X, Y] = [0, 1];
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.roundRect(
      x,
      y,
      this.mouse.sizeXY[X],
      this.mouse.sizeXY[Y],
      this.mouse.radius
    );
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
      this.mouse.targetRadius = 0;

      this.mouse.targetXY = [
        targetBoundingRect.x - this.mouse.offsetX - 8,
        targetBoundingRect.y - this.mouse.offsetY - 4,
      ];
      this.mouse.targetSizeXY = [
        targetBoundingRect.width + 16,
        targetBoundingRect.height + 8,
      ];
    } else {
      // interpolationSize = interpolationRadious = interpolationPos = 0.1;
      this.mouse.targetRadius = 50;
      this.mouse.targetSizeXY = [10, 10];
      this.mouse.targetXY = null;
    }
    const [X, Y] = [0, 1];
    if (this.mouse.targetXY !== null) {
      this.mouse.x = lerp(
        this.mouse.x,
        this.mouse.targetXY[X],
        interpolationPos
      );
      this.mouse.y = lerp(
        this.mouse.y,
        this.mouse.targetXY[Y],
        interpolationPos
      );
    }
    if (this.mouse.targetRadius !== null) {
      this.mouse.radius = lerp(
        this.mouse.radius,
        this.mouse.targetRadius,
        interpolationRadious
      );
    }
    if (this.mouse.targetSizeXY !== null) {
      this.mouse.sizeXY = [
        lerp(
          this.mouse.sizeXY[X],
          this.mouse.targetSizeXY[X],
          interpolationSize
        ),
        lerp(
          this.mouse.sizeXY[Y],
          this.mouse.targetSizeXY[Y],
          interpolationSize
        ),
      ];
    }
    this.cursorDraw();
  }
}

export default Cursor;
