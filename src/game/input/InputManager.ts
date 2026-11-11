/**
 * LAB GUARDIAN - Input Manager
 * Handles keyboard, mouse, and touch inputs cleanly
 */

export interface VirtualInputState {
  moveX: number; // -1 to 1
  moveZ: number; // -1 to 1
  isSprinting: boolean;
  isJumpRequested: boolean;
  isInteractRequested: boolean;
  isPauseRequested: boolean;
}

export class InputManager {
  private keysHeld = new Set<string>();
  private justPressed = new Set<string>();
  private virtualMovement = { x: 0, z: 0 };
  private virtualSprint: boolean = false;
  private virtualJump: boolean = false;
  private virtualInteract: boolean = false;
  private virtualFire: boolean = false;
  private virtualPause: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  public attach(): void {
    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: true });
    window.addEventListener('blur', this.handleBlur);
  }

  public detach(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.clearAll();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAll();
    }
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    const el = target;
    return (
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable ||
      (typeof el.getAttribute === 'function' && el.getAttribute('role') === 'textbox')
    );
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isEnabled || this.isTypingTarget(e.target)) {
      return;
    }

    const code = e.code;
    const key = e.key.toLowerCase();

    // Prevent default scroll actions on Space, Arrow keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      e.preventDefault();
    }

    if (!this.keysHeld.has(code) && !this.keysHeld.has(key)) {
      this.justPressed.add(code);
      this.justPressed.add(key);
    }

    this.keysHeld.add(code);
    this.keysHeld.add(key);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const code = e.code;
    const key = e.key.toLowerCase();
    this.keysHeld.delete(code);
    this.keysHeld.delete(key);
  }

  private handleBlur(): void {
    this.clearAll();
  }

  public clearAll(): void {
    this.keysHeld.clear();
    this.justPressed.clear();
    this.virtualMovement = { x: 0, z: 0 };
    this.virtualSprint = false;
    this.virtualJump = false;
    this.virtualInteract = false;
    this.virtualFire = false;
    this.virtualPause = false;
  }

  /**
   * Resets edge-triggered keys. Called at the end of each simulation frame.
   */
  public endFrame(): void {
    this.justPressed.clear();
    this.virtualJump = false;
    this.virtualInteract = false;
    this.virtualFire = false;
    this.virtualPause = false;
  }

  /**
   * Returns raw horizontal input (-1 to 1) along X and Z axes
   */
  public getRawMovement(): { x: number; z: number } {
    if (!this.isEnabled) return { x: 0, z: 0 };

    let x = 0;
    let z = 0;

    // Forward / Backward
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp') || this.keysHeld.has('w')) {
      z += 1;
    }
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown') || this.keysHeld.has('s')) {
      z -= 1;
    }

    // Left / Right
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft') || this.keysHeld.has('a')) {
      x -= 1;
    }
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight') || this.keysHeld.has('d')) {
      x += 1;
    }

    // Blend in virtual touch movement if active
    if (Math.abs(this.virtualMovement.x) > 0.05 || Math.abs(this.virtualMovement.z) > 0.05) {
      x = this.virtualMovement.x;
      z = this.virtualMovement.z;
    }

    return { x, z };
  }

  public isSprinting(): boolean {
    if (!this.isEnabled) return false;
    return (
      this.keysHeld.has('ShiftLeft') ||
      this.keysHeld.has('ShiftRight') ||
      this.virtualSprint
    );
  }

  public isJumpJustPressed(): boolean {
    if (!this.isEnabled) return false;
    return this.justPressed.has('Space') || this.virtualJump;
  }

  public isInteractJustPressed(): boolean {
    if (!this.isEnabled) return false;
    return (
      this.justPressed.has('KeyE') ||
      this.justPressed.has('e') ||
      this.virtualInteract
    );
  }

  public isFireJustPressed(): boolean {
    if (!this.isEnabled) return false;
    return (
      this.justPressed.has('KeyF') ||
      this.justPressed.has('f') ||
      this.virtualFire
    );
  }

  public isFiring(): boolean {
    if (!this.isEnabled) return false;
    return (
      this.keysHeld.has('KeyF') ||
      this.keysHeld.has('f') ||
      this.virtualFire
    );
  }

  public isPauseJustPressed(): boolean {
    return (
      this.justPressed.has('Escape') ||
      this.justPressed.has('KeyP') ||
      this.virtualPause
    );
  }

  public isPointerLockJustPressed(): boolean {
    return this.justPressed.has('KeyL') || this.justPressed.has('l');
  }

  public isCameraModeJustPressed(): boolean {
    return this.justPressed.has('KeyV') || this.justPressed.has('v');
  }

  public isMapJustPressed(): boolean {
    return this.justPressed.has('KeyM') || this.justPressed.has('m');
  }

  // Virtual inputs for touch devices or on-screen buttons
  public setVirtualMovement(x: number, z: number): void {
    this.virtualMovement = { x, z };
  }

  public setVirtualSprint(sprint: boolean): void {
    this.virtualSprint = sprint;
  }

  public triggerVirtualJump(): void {
    this.virtualJump = true;
  }

  public triggerVirtualInteract(): void {
    this.virtualInteract = true;
  }

  public triggerVirtualFire(): void {
    this.virtualFire = true;
  }

  public triggerVirtualPause(): void {
    this.virtualPause = true;
  }
}
