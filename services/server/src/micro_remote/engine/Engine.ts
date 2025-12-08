import { EventEmitter } from "stream";
import { Id } from "../../common/types";
import { generatePLayerEntity, resetBall } from "./engine_inits";
import {
  BallEntity,
  DataFrame,
  PlayerEntity,
  point,
} from "./engine_interfaces";
import {
  ball_size,
  delay,
  paddle_height,
  paddle_width,
} from "./engine_variables";
import { containsBetween } from "./engine_utils";
import { pong_party_delete } from "../pong_party";
import { get } from "http";
import { GameWebSocket, MessageType } from "../local_type";

interface GlobalEventHandlersEventMap {
  build: CustomEvent<number>;
}

export { PongEngine };
/**
 *
 *
 */
class PongEngine extends EventTarget {
  private id: string;
  private intervalId?: ReturnType<typeof setInterval>;
  private ball: BallEntity;
  private players_id: Id[];
  private players: PlayerEntity[];
  private views: DataFrame;
  private max_score: number;
  private startTimeout?: ReturnType<typeof setTimeout>;

  /**
   *
   * @param players_name
   * @param players_id
   * @param max_score
   */
  public constructor(
    players_name: string[],
    players_id: Id[],
    max_score: number = 10
  ) {
    super();
    this.players_id = [...players_id];
    this.max_score = max_score;
    this.id = "";

    this.players = [
      generatePLayerEntity(
        [players_name[0]],
        { x: 5, y: 50 - paddle_height / 2 },
        "E",
        2
      ),
      generatePLayerEntity(
        [players_name[1]],
        { x: 100 - 5 - paddle_width, y: 50 - paddle_height / 2 },
        "W",
        2
      ),
    ];

    this.ball = {
      view: { x: 50 - ball_size / 2, y: 50 - ball_size / 2, size: ball_size },
      speed: { x: 1, y: 0 },
      last: this.players[0],
    };

    this.views = {
      ball: this.ball.view,
      players: this.players.map((p) => p.view),
      state: "waiting",
    };
    this.resetStartTimeout();
  }

  private start() {
    if (this.intervalId !== undefined) this.stop();
    this.intervalId = setInterval(() => {
      this.tick();
    }, delay);
    this.resetStartTimeout(false);
  }

  private stop() {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }

  getId(): string {
    return this.id;
  }
  setId(id: string): void {
    this.id = id;
  }

  private resetStartTimeout(restart: boolean = true) {
    if (this.startTimeout !== undefined) clearTimeout(this.startTimeout);
    this.startTimeout = undefined;
    if (restart) {
      this.startTimeout = setTimeout(() => {
        this.abort();
      }, 1000 * 60 * 3); // 3 minutes
    }
  }

  /**
   *
   *
   */
  public tick() {
    if (this.views.state !== "playing") {
      let r = true;
      for (let p of this.players) if (p.ready === "WAIT") r = false;
      if (r == false) return;
      this.views.state = "playing";
    }

    let { ball, players } = this;

    this.movePlayers();
    this.moveBall();
    this.collideWithPlayers();

    // gonna need to either :
    //    cap the speed.x of the ball at the witdh of the paddle
    //    set a collision detection based on the movement of the ball and not its finishing point
    // also, need to add a detection of the colision based on the radius of the ball,
    // unlike now where it's based on it's single coordinate
    if (this.checkPoints())
      if (Math.max(...players.map((p) => p.view.score)) >= this.max_score) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
        this.views.state = "ended";
      }
    let r = true;
    for (let p of this.players) if (p.ready == "GONE") r = false;
    if (r == false) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.views.state = "ended";
    }
    this.players.forEach((p) => {
      if (p.ready != "GONE")
        p.ws?.send(JSON.stringify({ type: "GAME", message: this.views }));
    });
    if (this.views.state === "ended") () => {}; //todo notify finish
  }

  private moveBall(): void {
    this.ball.view.x += this.ball.speed.x;
    this.ball.view.y += this.ball.speed.y;
    if (this.ball.view.y + this.ball.view.size > 100 || this.ball.view.y <= 0) {
      this.ball.speed.y *= -1;
      this.ball.view.y =
        this.ball.view.y + this.ball.view.size >= 100
          ? 200 - (this.ball.view.y + this.ball.view.size * 2)
          : -this.ball.view.y;
    }
  }

  private movePlayers(): void {
    const gap = this.ball.view.size;
    this.players.forEach((player) => {
      player.view.TL.y = containsBetween(
        player.view.TL.y +
          (player.down ? player.speed : 0) -
          (player.up ? player.speed : 0),
        gap,
        100 - gap - player.view.height
      );
    });
  }

  private collideWithPlayers(): void {
    let overlap = (p1: point, s1: point, p2: point, s2: point): boolean => {
      if (p1.x > p2.x + s2.x || p2.x > p1.x + s1.x) return false;
      if (p1.y > p2.y + s2.y || p2.y > p1.y + s1.y) return false;
      return true;
    };

    let move = (player: PlayerEntity) => {
      if (
        overlap(
          this.ball.view,
          { x: this.ball.view.size, y: this.ball.view.size },
          player.view.TL,
          { x: player.view.width, y: player.view.height }
        )
      ) {
        this.ball.last = player;
        let nspeed = Math.abs(this.ball.speed.x) + 0.1;
        const angle =
          (((this.ball.view.y - player.view.TL.y + this.ball.view.size) /
            (player.view.height + this.ball.view.size) -
            0.5) *
            Math.PI *
            3) /
          6;
        if (nspeed > this.ball.view.size + player.view.width)
          nspeed = this.ball.view.size + player.view.width;
        if (player.view.direction === "E") {
          this.ball.speed.x = nspeed;
          // ball.view.x = player.view.TL.x + player.view.width;
          this.ball.speed.y = Math.tan(angle) * this.ball.speed.x;
        } else if (player.view.direction === "W") {
          this.ball.speed.x = -nspeed;
          // ball.view.x = player.view.TL.x - ball.view.size;
          this.ball.speed.y = Math.tan(-angle) * this.ball.speed.x;
        }
        if (Math.abs(this.ball.speed.y) < 0.001) {
          this.ball.speed.y = Math.random() * 0.01 - 0.005;
        }
      }
    };
    this.players.forEach(move);
  }

  private checkPoints(): boolean {
    if (this.ball.view.x + this.ball.view.size < 100 && this.ball.view.x > 0)
      return false;

    if (this.ball.last !== undefined) {
      this.ball.last.view.score += 1;
      resetBall(
        this.ball,
        this.ball.last.view.direction === "E" ? 1 : -1,
        0,
        this.ball.last
      );
    } else {
      resetBall(this.ball, 1, 0, this.players[0]);
    }
    return true;
  }

  public setPlayer(id: Id, ws: GameWebSocket): boolean {
    let player_index = this.players_id.findIndex((i) => i == id);
    if (player_index == -1) return false; //if not found in game
    if (this.players[player_index].ready === "HERE") return false; //if already here

    let player = this.players[player_index];

    player.ready = "HERE";
    player.ws = ws;

    set_player_event(ws, player);
    this.addEventListener("finish", () => {
      ws.close();
    });
    this.resetStartTimeout();
    if (this.players.every((p) => p.ready === "HERE")) this.start();
    return true;
  }

  public getPlayers() {
    return this.players;
  }

  private abort() {
    this.resetStartTimeout(false);
    this.stop();
    this.dispatchEvent(new Event("abort"));
  }
}

function set_player_event(ws: GameWebSocket, player: PlayerEntity): void {
  ws.addEventListener("message", (event) => {
    const messageObject = JSON.parse(event.data.toString()) as MessageType;
    if (messageObject.type !== "input") return;

    if (messageObject.payload == "pressDown") player.down = true;
    if (messageObject.payload == "releaseDown") player.down = false;
    if (messageObject.payload == "pressUp") player.up = true;
    if (messageObject.payload == "releaseUp") player.up = false;
  });

  ws.addEventListener("close", () => {
    player.ready = "GONE";
  });
}
