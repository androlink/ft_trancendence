import { main, resetNextInner } from "../../app.js";
import { sendMessage } from "../../html/events.js";
import {
  findLanguage,
  languageString,
  selectLanguage,
} from "../../html/templates.js";
import { createLocalPong, game } from "../engine/engine_game.js";
import { players } from "../engine/engine_variables.js";
import { updateGameAnimation } from "../pong.js";
import {
  getKeyConfig,
  inputController,
  loadLocalConfig,
} from "./local_settings.js";

/** a list of the players at the start of a tournament (and during the config) */
const playersInTournament: languageString[] = [];
/** the same list as above, but during the tournament, meaning without the losers */
const remainingPlayers: languageString[] = [];

/**
 * display a player, allowing an user to rename it or remove it.
 * Removing it won't change the name of the others, allowing to have multiple player with the same id
 * @param i the id of the player you want. WARING The player 1 has an id of 0
 * @returns the said HTML Element, ready to be inserted in DOM
 */
export function getTournamentPlayer(i: number): HTMLElement | null {
  if (playersInTournament[i] === undefined) {
    return null;
  }
  const span = document.createElement("span");
  span.className = "flex justify-between gap-2";
  const input = document.createElement("input");
  input.placeholder = findLanguage("username");
  input.type = "text";
  input.oninput = (e) => {
    const nextName = (e.target as HTMLInputElement).value;
    if (nextName) playersInTournament[i] = nextName.substring(0, 20);
    else playersInTournament[i] = selectLanguage(["player", String(i + 1)]);
  };
  input.value = selectLanguage(
    playersInTournament[i] || ["player", String(i + 1)]
  );
  input.maxLength = 20;
  input.className =
    "text-white text-center border outline-none focus:border-blue-500 border-white bg-[#171C3D] rounded p-1 w-0 grow";
  span.append(input);
  const text = document.createElement("p");
  text.textContent = "X";
  text.className = "font-bold my-auto text-white cursor-pointer";
  text.onclick = () => {
    playersInTournament.splice(i, 1);
    loadLocalConfig();
  };
  span.append(text);
  return span;
}

/**
 * allow the user to add a new player in the tournament via an HTML Element
 * @returns the said HTML Element, ready to be inserted in DOM
 */
export function allowNewPlayer(): HTMLElement {
  const p = document.createElement("p");
  p.className =
    "bg-purple-600 hover:bg-blue-500 border text-center text-white rounded cursor-pointer";
  p.onclick = () => {
    playersInTournament.push([
      "player",
      String(playersInTournament.length + 1),
    ]);
    loadLocalConfig();
  };
  p.textContent = "+";
  return p;
}

/** changes the config from classic game to tournament, all by itself */
export let tournament = false;

/**
 * small function to launch the config of a tournament
 */
export function createTournament() {
  tournament = true;
  for (const playerId of [0, 1] as [0, 1]) {
    const config = getKeyConfig(playerId ? "player_two" : "player_one");
    players[playerId].up = config[0];
    players[playerId].down = config[1];
  }
  self.addEventListener("popstate", abortTournament, { once: true });
  inputController.abort();
}

/**
 * small function to stop the config of a tournament
 */
export function abortTournament() {
  remainingPlayers.length = 0;
  tournament = false;
  players[0].view.name = ["player", "1"];
  const difficulty = players[1].bot_difficulty;
  players[1].view.name = [
    "bot",
    difficulty < 4 ? String(difficulty) : ["wall"],
  ];
  players[1].down = {};
  players[1].up = {};
  inputController.abort();
  self.removeEventListener("popstate", abortTournament);
}

/**
 * finalise the tournament preparations
 * @returns true if the game is able to be started, false otherwise
 */
export function startTournament(): boolean {
  if (playersInTournament.length < 2) {
    if (playersInTournament.length === 1)
      sendMessage(selectLanguage(["sarcastic", playersInTournament[0]]));
    abortTournament();
    loadLocalConfig();
    return false;
  }
  remainingPlayers.length = 0;
  remainingPlayers.push(...playersInTournament);
  players[0].view.name = remainingPlayers[0];
  players[1].view.name = remainingPlayers[1];
  return true;
}

/**
 * used at the end of a game (if launched with ending: true option).
 * Prepare a next game in the tournament, or shows the config again
 * @param lastWinner the id of the last winner, either 0 or 1, used for chat message and tournament scoring
 */
export function prepareNextGame(lastWinner: 0 | 1): void {
  if (!tournament || game?.views?.state !== "ended") {
    sendMessage(
      selectLanguage([
        "game winner",
        players[lastWinner].view.name,
        players[(1 + lastWinner) % 2].view.name,
      ])
    );
    resetNextInner();
    main({ requests: false });
    return;
  }
  remainingPlayers.push(players[lastWinner].view.name);
  remainingPlayers.splice(0, 2);
  if (remainingPlayers.length < 2) {
    game.views.state = "waiting";
    sendMessage(selectLanguage(["congrats", players[lastWinner].view.name]));
    abortTournament();
    resetNextInner();
    main({ requests: false });
    return;
  }
  sendMessage(
    selectLanguage([
      "game winner tournament",
      players[lastWinner].view.name,
      players[(1 + lastWinner) % 2].view.name,
    ])
  );
  players[0].view.name = remainingPlayers[0];
  players[1].view.name = remainingPlayers[1];
  sendMessage(
    selectLanguage([
      "game presentation",
      players[0].view.name,
      players[1].view.name,
    ])
  );
  createLocalPong({ ending: true });
  updateGameAnimation();
}

/**
 * creates an element to be display the list of players in a tournament or change them
 * @returns a div element, ready to be inserted in DOM
 */
export function tournamentSelectionConfig(): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "grid grid-rows-8 my-auto size-3/4 *:h-fit *:w-full rounded";
  for (let i = 0; i < 8; i++) {
    let elem = getTournamentPlayer(i);
    if (!elem) {
      div.append(allowNewPlayer());
      break;
    }
    div.append(elem);
  }
  return div;
}
