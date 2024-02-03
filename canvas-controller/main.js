import Mouse from "./mouse.js";

const _init = (resolve, reject) => {
  const wrapperDOM = document.getElementById("wrapper");
  if (!wrapperDOM) {
    throw new Error("renderElement#canvas-container not found");
  }

  const bgCanvas = document.getElementById("bg");
  if (!bgCanvas) throw new Error("#bg canvas not found");

  const bgCtx = bgCanvas.getContext("bitmaprenderer");
  if (!bgCtx) throw new Error("bg canvas context is null");
  const cursor = document.getElementById("base-cursor");

  const worker = new Worker("/canvas-controller/worker.js", { type: "module" });

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

    mouse.updateWrapperOffset(
      wrapperDOM?.offsetLeft ?? 0,
      wrapperDOM?.offsetTop ?? 0
    );
  };

  let workerMouseTM = null;
  const mouse = new Mouse(
    wrapperDOM?.offsetLeft ?? 0,
    wrapperDOM?.offsetTop ?? 0,
    cursor,
    () => {
      if (workerMouseTM) clearTimeout(workerMouseTM);
      workerMouseTM = setTimeout(() => {
        worker.postMessage({
          type: "mouseUpdate",
          mouse: mouse.arrOffsetVal,
        });
      }, 5);
    }
  );

  worker.postMessage({
    type: "init",
    width: bgCanvas.width,
    height: bgCanvas.height,
    mouse: mouse.arrOffsetVal,
  });

  // ~~~~~~~~~ EVENTS ~~~~~~~~~

  worker.addEventListener("message", function (e) {
    switch (e.data.type) {
      case "init-handshake":
        resolve();
        break;
      case "render":
        bgCtx.transferFromImageBitmap(e.data.bitmap);
        break;
    }
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  window.addEventListener("mousemove", (event) => {
    if (mouse.hovering === null) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }
  });

  document.addEventListener("mousedown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isDown = true;
  });

  document.addEventListener("mouseup", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isDown = false;
  });

  document.addEventListener("mouseover", (event) => {
    const target = event.target;
    if (target.tagName === "A" && target.className.indexOf("active") === -1) {
      mouse.hovering = target.getBoundingClientRect();
    } else {
      mouse.hovering = null;
    }
  });
};

const canvasInit = () => {
  return new Promise(_init);
};

export default canvasInit;
