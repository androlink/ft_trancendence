import { PongDisplay } from "../display.js";
import { DataFrame } from "../engine/engine_interfaces";

export class FrameManager {
  private display: PongDisplay | undefined = void 0;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.display = new PongDisplay();
    } catch (e) {
      console.error("diplay error:", e);
    }
  }

  public update(dataFrame: DataFrame) {
    if (!this.display) this.init();
    requestAnimationFrame(() => {
      this.display.update(dataFrame);
    });
  }
}
