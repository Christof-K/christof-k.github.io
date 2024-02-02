class Mouse {
  #x = -100;
  #y = -100;

  #radius = 10;
  #hovering = null;
  #isDown = false;

  #wrapperOffsetX = 0;
  #wrapperOffsetY = 0;

  constructor(wrapperOffsetX, wrapperOffsetY, cursorDOM, updateCallback) {
    this.#wrapperOffsetX = wrapperOffsetX;
    this.#wrapperOffsetY = wrapperOffsetY;
    this.cursorDOM = cursorDOM;
    this.updateCallback = updateCallback;
  }

  #updateCursor() {
    this.updateCallback();
  }

  set x(val) {
    this.#x = val;
    this.#updateCursor();
  }

  set y(val) {
    this.#y = val;
    this.#updateCursor();
  }

  set isDown(val) {
    this.#isDown = val;
    this.#updateCursor();
  }

  set hovering(val) {
    this.#hovering = val;
    this.#updateCursor();
  }

  get arrOffsetVal() {
    return {
      x: this.#x - this.#wrapperOffsetX,
      y: this.#y - this.#wrapperOffsetY,
      radius: this.#radius,
      hovering: this.#hovering,
      isDown: this.#isDown,
      wrapperOffsetX: this.#wrapperOffsetX,
      wrapperOffsetY: this.#wrapperOffsetY,
    };
  }

  get hovering() {
    return this.#hovering;
  }
}

export default Mouse;
