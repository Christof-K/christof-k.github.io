import * as THREE from 'three';
const wrapperDOM = document.getElementById("wrapper");
export const cursorComputeAndDraw = (mouse, ctx, cursorCanvas) => {
    let [interpolationSize, interpolationRadious, interpolationPos] = [1, 1, 1];
    if (mouse.hovering) {
        const target = mouse.hovering;
        interpolationSize = interpolationPos = 0.2;
        interpolationRadious = 0.1;
        mouse.targetRadius = 0;
        const targetBoundingRect = target.getBoundingClientRect();
        mouse.targetXY = [targetBoundingRect.x - 8, targetBoundingRect.y - 4];
        mouse.targetSizeXY = [targetBoundingRect.width + 16, targetBoundingRect.height + 8];
    }
    else {
        // interpolationSize = interpolationRadious = interpolationPos = 0.1;
        mouse.targetRadius = 50;
        mouse.targetSizeXY = [10, 10];
        mouse.targetXY = null;
    }
    const [X, Y] = [0, 1];
    if (mouse.targetXY !== null) {
        mouse.x = (THREE.MathUtils.lerp(mouse.x, mouse.targetXY[X], interpolationPos));
        mouse.y = (THREE.MathUtils.lerp(mouse.y, mouse.targetXY[Y], interpolationPos));
    }
    if (mouse.targetRadius !== null) {
        mouse.radius = (THREE.MathUtils.lerp(mouse.radius, mouse.targetRadius, interpolationRadious));
    }
    if (mouse.targetSizeXY !== null) {
        mouse.sizeXY = [
            (THREE.MathUtils.lerp(mouse.sizeXY[X], mouse.targetSizeXY[X], interpolationSize)),
            (THREE.MathUtils.lerp(mouse.sizeXY[Y], mouse.targetSizeXY[Y], interpolationSize))
        ];
    }
    cursorDraw(mouse, ctx, cursorCanvas);
};
const cursorDraw = (mouse, ctx, cursorCanvas) => {
    var _a, _b;
    const x = mouse.x - ((_a = wrapperDOM === null || wrapperDOM === void 0 ? void 0 : wrapperDOM.offsetLeft) !== null && _a !== void 0 ? _a : 0);
    const y = mouse.y - ((_b = wrapperDOM === null || wrapperDOM === void 0 ? void 0 : wrapperDOM.offsetTop) !== null && _b !== void 0 ? _b : 0);
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    if (x < 0 || y < 0)
        return;
    const [X, Y] = [0, 1];
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.roundRect(x, y, mouse.sizeXY[X], mouse.sizeXY[Y], mouse.radius);
    if (mouse.isDown)
        ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
};
