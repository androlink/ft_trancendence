import { main, resetNextInner } from "../app.js";
import { sendMessage } from "../html/events.js";
import {
  findLanguage,
  languageString,
  selectLanguage,
} from "../html/templates.js";
import {
  createLocalPong,
  deleteLocalPong,
  game,
} from "./engine/engine_game.js";
import { keyControl } from "./engine/engine_interfaces.js";
import { players } from "./engine/engine_variables.js";
import { updateGameAnimation } from "./pong.js";

let controller = new AbortController();
/**
 * waits for a key press to change the input
 * @param e mouse event from an "on click";
 * @param which which keyConfig to change (up or down)
 * @param player_id the player one (0) or player two (1)
 */
function changeInput(
  e: MouseEvent,
  which: "down" | "up",
  player_id: 0 | 1
): void {
  controller.abort();
  controller = new AbortController();
  controller.signal.addEventListener(
    "abort",
    () => ((e.target as Element).textContent = players[player_id][which].key)
  );
  document.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      // the bare minimum to forbid is Space (because it pauses the game), AltLeft, AltRight and ContextMenu (because browser shortcut)
      if (
        [
          "Enter",
          "Space",
          "Backspace",
          "AltLeft",
          "AltRight",
          "ContextMenu",
        ].includes(e.code)
      ) {
        loadLocalConfig();
        return;
      }
      const other = players[player_id][which === "down" ? "up" : "down"];
      if (
        (other.code !== undefined && other.code === e.code) ||
        other.key.toLowerCase() === e.key.toLowerCase()
      ) {
        loadLocalConfig();
        return;
      }
      players[player_id][which].key = e.key;
      players[player_id][which].code = e.code;
      set_key_config(player_id, which, { key: e.key, code: e.code });
      loadLocalConfig();
    },
    { once: true, signal: controller.signal }
  );
  (e.target as Element).textContent = "Listen...";
}

const playersInTournament: languageString[] = [];
/**
 * generate a player for
 */
function getTournamentPlayer(i: number): HTMLElement | null {
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
    else playersInTournament[i] = selectLanguage(["player", String(i)]);
  };
  input.value = selectLanguage(
    playersInTournament[i] || ["player", String(i + 1)]
  );
  input.maxLength = 20;
  input.className =
    "text-white text-center border outline-offset-2 outline-sky-500 focus:outline-2 border-black bg-gray-700 rounded px-1 w-0 grow";
  span.append(input);
  const text = document.createElement("p");
  text.textContent = "X";
  text.className = "font-bold text-white cursor-pointer";
  text.onclick = () => {
    playersInTournament.splice(i, 1);
    loadLocalConfig();
  };
  span.append(text);
  return span;
}

function allowNewPlayer(): HTMLElement {
  const p = document.createElement("p");
  p.className = "bg-gray-800 text-center text-white rounded cursor-pointer";
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

/**
 * gives a key config from the local storage
 * @param player_id the string value of the key corresponging to the player in config
 */
export function get_key_config(
  player_id: "player_one" | "player_two"
): [keyControl, keyControl] {
  const defaultConfig = {
    player_one: [{ key: "w" }, { key: "s" }] as [keyControl, keyControl],
    player_two: [{ key: "o" }, { key: "l" }] as [keyControl, keyControl],
  };
  const res = [undefined, undefined] as [keyControl, keyControl];
  for (const which of [0, 1]) {
    try {
      res[which] = JSON.parse(
        localStorage.getItem(
          `${player_id === "player_one" ? 0 : 1}_${which ? "down" : "up"}`
        ) || "crash"
      );
    } catch (err) {
      res[which] = defaultConfig[player_id][which];
    }
  }
  return res;
}

/**
 * set a keyControl to the local storage
 * @param controls the keyControl you wanna remember
 */
function set_key_config(
  player_id: 0 | 1,
  which: "down" | "up",
  controls: keyControl
): void {
  players[player_id][which] = controls;
  localStorage.setItem(`${player_id}_${which}`, JSON.stringify(controls));
}

/**
 * gives a HTML element
 * @param player_id the string value of the key corresponging to the player in config
 */
function player_config(player_id: 0 | 1): HTMLElement {
  controller.abort();
  const div = document.createElement("div");
  div.className = `flex flex-col justify-around h-3/4 my-auto border w-3/4 *:size-fit *:mx-auto rounded bg-gray-600 ${player_id === 0 ? "col-start-1" : "col-start-3"}`;
  if (
    players[player_id].up.key === undefined ||
    players[player_id].down.key === undefined
  ) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add player");
    button.className =
      "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[player_id].view.name = ["player", player_id ? "2" : "1"];
      const config = get_key_config(player_id ? "player_two" : "player_one");
      players[player_id].up = config[0];
      players[player_id].down = config[1];
      loadLocalConfig();
    };
    div.appendChild(button);
    const span = document.createElement("span");
    span.className = "flex flex-col *:size-fit place-items-center";
    const label = document.createElement("label");
    label.textContent = findLanguage("difficulty");
    label.title = findLanguage("pong formula");
    label.className = "whitespace-pre-line px-3";
    span.appendChild(label);
    const range = document.createElement("input");
    range.type = "range";
    range.min = "1";
    range.max = "4";
    range.step = "0.2";
    range.value = String(players[player_id].bot_difficulty);
    range.onchange = (e) => {
      const difficulty = parseFloat((e.target as HTMLInputElement).value);
      players[player_id].view.name = [
        "bot",
        difficulty < 4 ? String(difficulty) : ["wall"],
      ];
      players[player_id].bot_difficulty = difficulty;
    };
    const label_value = document.createElement("label");
    function updateLabel() {
      const difficulty = range.value;
      label_value.textContent =
        parseFloat(difficulty) < 4 ? difficulty : findLanguage("wall");
    }
    updateLabel();
    range.oninput = updateLabel;
    span.appendChild(range);
    span.appendChild(label_value);
    div.appendChild(span);
    return div;
  }
  if (!tournament) {
    const input = document.createElement("input");
    input.placeholder = findLanguage("username");
    if (typeof players[player_id].view.name === "string") {
      input.value = players[player_id].view.name;
    }
    input.type = "text";
    input.oninput = (e) => {
      const nextName = (e.target as HTMLInputElement).value;
      if (nextName) players[player_id].view.name = nextName.substring(0, 20);
      else players[player_id].view.name = ["player", player_id ? "2" : "1"];
    };
    input.maxLength = 20;
    input.className = "text-white text-center border border-black rounded px-1";
    div.appendChild(input);
  } else {
    const text = document.createElement("text");
    text.textContent = selectLanguage([
      "player",
      !player_id ? ["left"] : ["right"],
    ]);
    text.className = "text-center text-white px-1";
    div.appendChild(text);
  }
  const up = document.createElement("button");
  up.textContent = players[player_id].up.key;
  up.className = "text-white border border-black rounded px-1 cursor-pointer";
  up.onclick = (e) => changeInput(e, "up", player_id);
  div.appendChild(up);
  const down = document.createElement("p");
  down.textContent = players[player_id].down.key;
  down.className = "text-white border border-black rounded px-1 cursor-pointer";
  down.onclick = (e) => changeInput(e, "down", player_id);
  div.appendChild(down);
  if (!tournament) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add bot");
    button.className =
      "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[player_id].view.name = [
        "bot",
        String(players[player_id].bot_difficulty),
      ];
      players[player_id].up = {};
      players[player_id].down = {};
      loadLocalConfig();
    };
    div.appendChild(button);
  }
  return div;
}

/**
 * small function to launch the config of a tournament
 */
function createTournament() {
  tournament = true;
  for (const player_id of [0, 1] as [0, 1]) {
    const config = get_key_config(player_id ? "player_two" : "player_one");
    players[player_id].up = config[0];
    players[player_id].down = config[1];
  }
  label.hidden = true;
  self.addEventListener("popstate", abortTournament, { once: true });
  controller.abort();
}

/**
 * small function to stop the config of a tournament
 */
function abortTournament() {
  playersInTournament.length = 0;
  label.hidden = false;
  tournament = false;
  players[0].view.name = ["player", "1"];
  const difficulty = players[1].bot_difficulty;
  players[1].view.name = [
    "bot",
    difficulty < 4 ? String(difficulty) : ["wall"],
  ];
  players[1].down = {};
  players[1].up = {};
  controller.abort();
  self.removeEventListener("popstate", abortTournament);
}

/** the span of inputs */
const span = document.createElement("span");
/** the button to launch the game */
const button = document.createElement("button");
/** the button to launch tournaments */
const button2 = document.createElement("button");
/** the div of players*/
const div = document.createElement("div");
const label = document.createElement("label");
const input = document.createElement("input");

function removeSettingsMenu() {
  span.remove();
  button.remove();
  button2.remove();
  label.remove();
  input.remove();
}
let tournament = false;
/**
 * used to chose who will play with what when playing local
 * Display is inspired of smash bros, kinda
 */
export function loadLocalConfig() {
  if (game?.intervalId !== undefined) {
    // happends if page changes with a game still running (example: changing language)
    updateGameAnimation();
    console.log("game is already running, can't display the config, keep up");
    return;
  }
  // below is in case we change page while changing keyboard config (the "Listen..." period)
  self.addEventListener("popstate", () => controller.abort(), { once: true });
  const inner = document.getElementById("inner");
  const proof = document.getElementById("local config");

  if (!inner || !proof) {
    console.log(
      "yeah no, calling that function by yourself would be annoying, trust me"
    );
    return;
  }
  removeSettingsMenu();

  const fragment = document.createDocumentFragment();
  span.innerHTML = "";
  span.className = `absolute top-0 size-full *:justify-self-center grid ${!tournament ? "grid-cols-3" : "grid-cols-4"}`;
  for (const player_id of [0, 1] as [0, 1]) {
    span.appendChild(player_config(player_id));
  }
  fragment.appendChild(span);
  button.className = `max-w-1/4 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 -translate-y-1/2`;
  button.textContent = findLanguage("launch game");
  button.onclick = () => {
    if (tournament) {
      if (playersInTournament.length < 2) {
        if (playersInTournament.length === 1)
          sendMessage(selectLanguage(["sarcastic", playersInTournament[0]]));
        abortTournament();
        loadLocalConfig();
        return;
      }
      players[0].view.name = playersInTournament[0];
      players[1].view.name = playersInTournament[1];
    }
    sendMessage(
      selectLanguage([
        "game presentation",
        players[0].view.name,
        players[1].view.name,
      ])
    );
    createLocalPong({ ending: Boolean(tournament || input.checked) });
    removeSettingsMenu();
    updateGameAnimation();
    proof.remove();
  };
  fragment.appendChild(button);
  label.textContent = "single game";
  label.className = `max-w-1/4 text-sm text-sm/6 leading text-white cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 translate-y-1/2`;
  input.type = "checkbox";
  input.className = "accent-sky-500 mx-1";
  label.append(input);
  fragment.appendChild(label);
  button2.className = `max-w-1/4 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 translate-y-4/2`;
  button2.textContent = findLanguage(!tournament ? "tournament" : "classic");
  button2.onclick = () => {
    !tournament ? createTournament() : abortTournament();
    loadLocalConfig();
  };
  fragment.appendChild(button2);
  if (tournament) {
    div.innerHTML = "";
    div.className =
      "grid grid-rows-8 my-auto size-3/4 *:h-fit *:w-full rounded";
    for (let i = 0; i < 8; i++) {
      let elem = getTournamentPlayer(i);
      if (!elem) {
        div.append(allowNewPlayer());
        break;
      }
      div.append(elem);
    }
    span.appendChild(div);
  }
  inner.appendChild(fragment);
}
self["loadLocalConfig"] = loadLocalConfig;

export function nextGame(lastWinner: 0 | 1) {
  if (!tournament || game?.views?.state !== "ended") {
    sendMessage(
      selectLanguage([
        "game winner",
        players[lastWinner].view.name,
        players[(1 + lastWinner) % 2].view.name,
      ])
    );
    resetNextInner();
    main(false, false);
    return;
  }
  playersInTournament.push(players[lastWinner].view.name);
  playersInTournament.splice(0, 2);
  if (playersInTournament.length < 2) {
    game.views.state = "waiting";
    console.log(players);
    sendMessage(selectLanguage(["congrats", players[lastWinner].view.name]));
    abortTournament();
    resetNextInner();
    main(false, false);
    return;
  }
  sendMessage(
    selectLanguage([
      "game winner tournament",
      players[lastWinner].view.name,
      players[(1 + lastWinner) % 2].view.name,
    ])
  );
  players[0].view.name = playersInTournament[0];
  players[1].view.name = playersInTournament[1];
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
