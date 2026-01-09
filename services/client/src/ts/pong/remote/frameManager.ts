import { PongDisplay } from "../display.js";
import { DataFrame } from "../engine/engine_interfaces";
import { findLanguage, selectLanguage } from "../../html/templates.js";

export class FrameManager {
  private display: PongDisplay | undefined = void 0;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.display = new PongDisplay();
      this.display.messages.waiting = findLanguage("PONG_WAIT_PLAYER_MESSAGE");
    } catch {}
  }

  public update(dataFrame: DataFrame) {
    if (!this.display) this.init();
    requestAnimationFrame(() => {
      this.display.update(dataFrame);
    });
  }
}
