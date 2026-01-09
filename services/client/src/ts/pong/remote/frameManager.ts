import { PongDisplay } from "../display.js";
import { DataFrame } from "../engine/engine_interfaces";
import { findLanguage, selectLanguage } from "../../html/templates.js";
import { sendMessage } from "../../html/events.js";

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
    if (dataFrame.state == "ended")
    {
      const scores = dataFrame.players.map((p) => p.score);

      let players = [dataFrame.players[(scores[0] > scores[1] ? 0 : 1)].name, dataFrame.players[(scores[0] = scores[1] ? 0 : 1)].name];
      sendMessage(selectLanguage(["game winner", players[0] , players[1]]));
    }
    if (!this.display) this.init();
    requestAnimationFrame(() => {
      this.display.update(dataFrame);
    });
  }
}
