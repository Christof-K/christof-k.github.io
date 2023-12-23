import * as THREE from 'three';
import { IMouse } from './index';

export const cursorCompute = (mouse: IMouse) => {

  if (mouse.hovering) {
    const target = mouse.hovering;
    mouse.interpolationVal = 0.1;
    mouse.targetRadius = 2;
    mouse.targetXY = [target.offsetLeft - 5, target.offsetTop - 4];
    mouse.targetSizeXY = [target.offsetWidth + 10, target.offsetHeight + 8];


  } else {
    mouse.interpolationVal = 1;
    mouse.targetRadius = 10;
    mouse.targetSizeXY = [10,10];
    mouse.targetXY = null;
  }

  const [X, Y] = [0, 1];
  if (mouse.targetXY !== null) { // fixme: --
    mouse.x = Math.floor(THREE.MathUtils.lerp(mouse.x, mouse.targetXY[X], mouse.interpolationVal));
    mouse.y = Math.floor(THREE.MathUtils.lerp(mouse.y, mouse.targetXY[Y], mouse.interpolationVal));
  }
  if (mouse.targetRadius !== null) {
    mouse.radius = Math.floor(THREE.MathUtils.lerp(mouse.radius, mouse.targetRadius, mouse.interpolationVal));
  }
  if (mouse.targetSizeXY !== null) {
    mouse.sizeXY = [
      Math.floor(THREE.MathUtils.lerp(mouse.sizeXY[X], mouse.targetSizeXY[X], mouse.interpolationVal)),
      Math.floor(THREE.MathUtils.lerp(mouse.sizeXY[Y], mouse.targetSizeXY[Y], mouse.interpolationVal))
    ]
  }

}


export const cursorDraw = (mouse: IMouse, ctx: CanvasRenderingContext2D, cursorCanvas: HTMLCanvasElement) => {
  const wrapperDOM = document.getElementById("wrapper");

  const x = mouse.x - (wrapperDOM?.offsetLeft ?? 0);
  const y = mouse.y - (wrapperDOM?.offsetTop ?? 0);

  ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
  if (x < 0 || y < 0) return;
  const [X, Y] = [0, 1];

  ctx.beginPath();
  ctx.roundRect(x, y, mouse.sizeXY[X], mouse.sizeXY[Y], mouse.radius);

  if (mouse.isDown) ctx.fill()
  ctx.stroke();
}
