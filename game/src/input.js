// Keyboard and mouse input for Gobble Dash. The game reads this one object:
// jump / slide / dash are edge-triggered (true only on the frame the key or
// click lands), while held keys stay true for as long as they are down.
export class Input {
  constructor(canvas) {
    this.jumpPressed = false; // edge: jump / flap
    this.slidePressed = false; // edge: slide under a fence
    this.dashPressed = false; // edge: dash burst
    this.pausePressed = false; // edge: pause
    this.restartPressed = false; // edge: restart from an end screen
    this.startPressed = false; // edge: start from the title screen
    this.anyPressed = false; // edge: any key or click
    this.jumpHeld = false;
    this.slideHeld = false;
    this._keys = new Set();
    this._canvas = canvas;
    this._onKeyDown = (event) => this._keyDown(event);
    this._onKeyUp = (event) => this._keyUp(event);
    this._onMouse = (event) => this._mouse(event);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('pointerdown', this._onMouse);
  }

  _keyDown(event) {
    if (event.repeat) return;
    const code = event.code;
    if (['ArrowUp', 'ArrowDown', 'Space'].includes(code)) event.preventDefault();
    this.anyPressed = true;
    this._keys.add(code);
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      this.jumpPressed = true;
      this.jumpHeld = true;
      this.startPressed = true;
      this.restartPressed = true;
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.slidePressed = true;
      this.slideHeld = true;
    }
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyX' || code === 'KeyD' || code === 'ArrowRight') {
      this.dashPressed = true;
    }
    if (code === 'KeyP' || code === 'Escape') this.pausePressed = true;
    if (code === 'KeyR' || code === 'Enter') {
      this.restartPressed = true;
      this.startPressed = true;
    }
    if (code === 'KeyM') this.mutePressed = true;
  }

  _keyUp(event) {
    this._keys.delete(event.code);
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') this.jumpHeld = false;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') this.slideHeld = false;
  }

  _mouse(event) {
    event.preventDefault();
    this.anyPressed = true;
    // Left half of the screen jumps, right half dashes; a click anywhere
    // also starts the game or restarts from an end screen.
    const rect = this._canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    if (x < 0.55) {
      this.jumpPressed = true;
      this.jumpHeld = true;
    } else {
      this.dashPressed = true;
    }
    this.startPressed = true;
    this.restartPressed = true;
  }

  // Call at the end of every frame: edge flags live for exactly one frame.
  endFrame() {
    this.jumpPressed = false;
    this.slidePressed = false;
    this.dashPressed = false;
    this.pausePressed = false;
    this.restartPressed = false;
    this.startPressed = false;
    this.anyPressed = false;
    this.mutePressed = false;
  }
}
