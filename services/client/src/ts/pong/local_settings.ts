import { sendMessage } from "../html/events.js";
import { findLanguage, selectLanguage } from "../html/templates.js";
import { createLocalPong, game } from "./engine/engine_game.js";
import { keyControl } from "./engine/engine_interfaces.js";
import { players } from "./engine/engine_variables.js";
import { updateLocalGame } from "./pong.js";

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
  div.className =
    "flex flex-col justify-around h-3/4 my-auto border w-3/4 *:size-fit *:mx-auto rounded bg-gray-600";
  if (
    players[player_id].up.key === undefined ||
    players[player_id].down.key === undefined
  ) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add player");
    button.className =
      "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[player_id].view.name = [player_id ? "player_two" : "player_one"];
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
        "bot", (difficulty < 4) ? String(difficulty) : findLanguage("wall")
      ];
      players[player_id].bot_difficulty = difficulty;
    };
    const label_value = document.createElement("label");
    label_value.textContent = String(players[player_id].bot_difficulty);
    range.oninput = (e) => {
      const difficulty = (e.target as HTMLInputElement).value;
      label_value.textContent = parseFloat(difficulty) < 4 ? difficulty : findLanguage("wall");
    };
    span.appendChild(range);
    span.appendChild(label_value);
    div.appendChild(span);
    return div;
  }
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
  input.className =
    "text-white text-center border border-black text-black rounded";
  div.appendChild(input);
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
  return div;
}

const span = document.createElement("span");
const button = document.createElement("button");
/**
 * used to chose who will play with what when playing local
 * Display will be inspired of smash bros, kinda
 */
function loadLocalConfig() {
  if (game?.intervalId !== undefined) {
    // happends if page changes with a game still running (example: changing language)
    updateLocalGame();
    return;
  }
  // below is in case we change page while changing keyboard config (the "Listen..." period)
  self.addEventListener("popstate", (e) => controller.abort(), { once: true });
  const inner = document.getElementById("inner");
  const proof = document.getElementById("local config");

  if (!inner || !proof) {
    console.log(
      "yeah no, calling that function by yourself would be annoying, trust me"
    );
    return;
  }

  if (inner.contains(span)) inner.removeChild(span);
  if (inner.contains(button)) inner.removeChild(button);

  const fragment = document.createDocumentFragment();
  span.innerHTML = "";
  span.className =
    "absolute top-0 size-full *:justify-self-center gap-40 grid grid-cols-2";
  for (const player_id of [0, 1] as [0, 1]) {
    span.appendChild(player_config(player_id));
  }
  fragment.appendChild(span);
  button.className =
    "max-w-40 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
  button.textContent = findLanguage("launch game");
  button.onclick = () => {
    // needs to be translated, but will be useful for tournament.
    // We'll wait the merge with sjean branch for the translation, because it allows to set more complex messages
    // like a text with texts inside, with texts inside, like the announcmenet + the bot + its level
    sendMessage(
      selectLanguage([
        "game presentation",
        players[0].view.name,
        players[1].view.name,
      ])
    );
    inner.removeChild(span);
    inner.removeChild(button);
    createLocalPong();
    updateLocalGame();
    proof.remove();
  };
  fragment.appendChild(button);
  inner.appendChild(fragment);
}
self["loadLocalConfig"] = loadLocalConfig;
