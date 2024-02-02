const wrapperDOM = document.getElementById("wrapper");
if (!wrapperDOM) {
  throw new Error("renderElement#canvas-container not found");
}

const bgCanvas = document.getElementById("bg");
if (!bgCanvas) throw new Error("#bg canvas not found");

const bgCtx = bgCanvas.getContext("bitmaprenderer");
if (!bgCtx) throw new Error("bg canvas context is null");

bgCanvas.width = wrapperDOM.clientWidth;
bgCanvas.height = wrapperDOM.clientHeight;

const resizeCanvas = () => {
  bgCanvas.width = wrapperDOM.clientWidth;
  bgCanvas.height = wrapperDOM.clientHeight;

  worker.postMessage({
    type: "resizeCanvas",
    width: bgCanvas.width,
    height: bgCanvas.height,
  });
};

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
  offsetY: wrapperDOM?.offsetTop ?? 0,
};

const worker = new Worker("/canvas-controller/worker.js", { type: "module" });
worker.postMessage({
  type: "init",
  width: bgCanvas.width,
  height: bgCanvas.height,
  mouse: mouse,
});

worker.addEventListener("message", function (e) {
  if (e.data.msg === "render") {
    bgCtx.transferFromImageBitmap(e.data.bitmap);
  }
});

// ~~~~~~~~~ EVENTS ~~~~~~~~~
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const mouseXYUpdate = (x, y) => {
  mouse.x = x - mouse.offsetX;
  mouse.y = y - mouse.offsetY;
  return mouse;
};

window.addEventListener("mousemove", (event) => {
  if (mouse.hovering === null) {
    worker.postMessage({
      type: "mouseUpdate",
      mouse: mouseXYUpdate(event.clientX, event.clientY),
    });
  }
});

document.addEventListener("mousedown", (event) => {
  if (!mouse.hovering) {
    mouseXYUpdate(event.clientX, event.clientY);
  }
  mouse.isDown = true;
  worker.postMessage({ type: "mouseUpdate", mouse: mouse });
});

document.addEventListener("mouseup", (event) => {
  if (!mouse.hovering) {
    mouseXYUpdate(event.clientX, event.clientY);
  }
  mouse.isDown = false;
  worker.postMessage({ type: "mouseUpdate", mouse: mouse });
});

document.addEventListener("mouseover", (event) => {
  const target = event.target;
  if (target.tagName === "A" && target.className.indexOf("active") === -1) {
    mouse.hovering = target.getBoundingClientRect();
  } else {
    mouse.hovering = null;
  }

  worker.postMessage({
    type: "mouseUpdate",
    mouse: mouse,
  });
});
