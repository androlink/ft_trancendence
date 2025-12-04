import { sendMessage } from "../../html/events.js";
import { findLanguage, selectLanguage } from "../../html/templates.js";
import { createLocalPong, game } from "../engine/engine_game.js";
import { keyControl } from "../engine/engine_interfaces.js";
import { players } from "../engine/engine_variables.js";
import { updateGameAnimation } from "../pong.js";
import {
  abortTournament,
  createTournament,
  startTournament,
  tournament,
  tournamentSelectionConfig,
} from "./tournaments_settings.js";

export let inputController = new AbortController();
/**
 * waits for a key press to change the input
 * @param e mouse event from an "on click";
 * @param which which keyConfig to change (up or down)
 * @param playerId the player one (0) or player two (1)
 */
function changeInput(
  e: MouseEvent,
  which: "down" | "up",
  playerId: 0 | 1
): void {
  inputController.abort();
  inputController = new AbortController();
  inputController.signal.addEventListener(
    "abort",
    () => ((e.target as Element).textContent = players[playerId][which].key)
  );
  document.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      // the bare minimum to forbid is Space (because it pauses the game), AltLeft, AltRight and ContextMenu (because browser shortcut)
      if (["Space", "AltLeft", "AltRight", "ContextMenu"].includes(e.code)) {
        loadLocalConfig();
        return;
      }
      const other = players[playerId][which === "down" ? "up" : "down"];
      if (
        (other.code !== undefined && other.code === e.code) ||
        other.key.toLowerCase() === e.key.toLowerCase()
      ) {
        loadLocalConfig();
        return;
      }
      players[playerId][which].key = e.key;
      players[playerId][which].code = e.code;
      set_key_config(playerId, which, { key: e.key, code: e.code });
      loadLocalConfig();
    },
    { once: true, signal: inputController.signal }
  );
  (e.target as Element).textContent = "Listen...";
}

/**
 * gives a key config from the local storage
 * @param playerId the string value of the key corresponging to the player in config
 */
export function getKeyConfig(
  playerId: "player_one" | "player_two"
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
          `${playerId === "player_one" ? 0 : 1}_${which ? "down" : "up"}`
        ) || "crash"
      );
    } catch (err) {
      res[which] = defaultConfig[playerId][which];
    }
  }
  return res;
}

/**
 * set a keyControl to the local storage
 * @param controls the keyControl you wanna remember
 */
function set_key_config(
  playerId: 0 | 1,
  which: "down" | "up",
  controls: keyControl
): void {
  players[playerId][which] = controls;
  localStorage.setItem(`${playerId}_${which}`, JSON.stringify(controls));
}

/**
 * gives a HTML element
 * @param playerId the string value of the key corresponging to the player in config
 */
function player_config(playerId: 0 | 1): HTMLElement {
  inputController.abort();
  const div = document.createElement("div");
  div.className = `flex flex-col justify-around h-3/4 my-auto border w-3/4 *:size-fit *:mx-auto rounded bg-gray-600 ${playerId === 0 ? "col-start-1" : "col-start-3"}`;
  if (
    players[playerId].up.key === undefined ||
    players[playerId].down.key === undefined
  ) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add player");
    button.className =
      "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[playerId].view.name = ["player", playerId ? "2" : "1"];
      const config = getKeyConfig(playerId ? "player_two" : "player_one");
      players[playerId].up = config[0];
      players[playerId].down = config[1];
      loadLocalConfig();
    };
    div.append(button);
    const span = document.createElement("span");
    span.className = "flex flex-col *:size-fit place-items-center";
    const label = document.createElement("label");
    label.textContent = findLanguage("difficulty");
    label.title = findLanguage("pong formula");
    label.className = "whitespace-pre-line px-3";
    span.append(label);
    const range = document.createElement("input");
    range.type = "range";
    range.min = "1";
    range.max = "4";
    range.step = "0.2";
    range.value = String(players[playerId].bot_difficulty);
    range.onchange = (e) => {
      const difficulty = parseFloat((e.target as HTMLInputElement).value);
      players[playerId].view.name = [
        "bot",
        difficulty < 4 ? String(difficulty) : ["wall"],
      ];
      players[playerId].bot_difficulty = difficulty;
    };
    const label_value = document.createElement("label");
    function updateLabel() {
      const difficulty = range.value;
      label_value.textContent =
        parseFloat(difficulty) < 4 ? difficulty : findLanguage("wall");
    }
    updateLabel();
    range.oninput = updateLabel;
    span.append(range);
    span.append(label_value);
    div.append(span);
    return div;
  }
  if (!tournament) {
    const input = document.createElement("input");
    input.placeholder = findLanguage("username");
    if (typeof players[playerId].view.name === "string") {
      input.value = players[playerId].view.name;
    }
    input.type = "text";
    input.oninput = (e) => {
      const nextName = (e.target as HTMLInputElement).value;
      if (nextName) players[playerId].view.name = nextName.substring(0, 20);
      else players[playerId].view.name = ["player", String(playerId + 1)];
    };
    input.maxLength = 20;
    input.className = "text-white text-center border border-black rounded px-1";
    div.append(input);
  } else {
    const text = document.createElement("text");
    text.textContent = selectLanguage([
      "player",
      !playerId ? ["left"] : ["right"],
    ]);
    text.className = "text-center text-white px-1";
    div.append(text);
  }
  const up = document.createElement("button");
  up.textContent = players[playerId].up.key;
  up.className = "text-white border border-black rounded px-1 cursor-pointer";
  up.onclick = (e) => changeInput(e, "up", playerId);
  div.append(up);
  const down = document.createElement("p");
  down.textContent = players[playerId].down.key;
  down.className = "text-white border border-black rounded px-1 cursor-pointer";
  down.onclick = (e) => changeInput(e, "down", playerId);
  div.append(down);
  if (!tournament) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add bot");
    button.className =
      "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[playerId].view.name = [
        "bot",
        String(players[playerId].bot_difficulty),
      ];
      players[playerId].up = {};
      players[playerId].down = {};
      loadLocalConfig();
    };
    div.append(button);
  }
  return div;
}

/** the span of inputs */
const span = document.createElement("span");
/** the button to launch the game */
const button = document.createElement("button");
/** the button to launch tournaments */
const button2 = document.createElement("button");
/** the label of a checkbox to have a single game */
const label = document.createElement("label");

/**
 * the name is explicit enough
 * @param visible true if visible (meaning hidden to false)
 */
export function toggleLabelVisibility(visible: boolean) {
  if (visible !== undefined) label.hidden = !visible;
  else label.hidden = !label.hidden;
}

/**
 * removes all the HTML elements above of the DOM
 */
function removeSettingsMenu(): void {
  span.remove();
  button.remove();
  button2.remove();
  label.remove();
}

/**
 * used to chose who will play with what when playing local
 * Display is inspired of smash bros, kinda
 */
export function loadLocalConfig() {
  if (game?.intervalId !== undefined) {
    // happends if page changes with a game still running (example: changing language)
    updateGameAnimation();
    return;
  }
  // below is in case we change page while changing keyboard config (the "Listen..." period)
  self.addEventListener("popstate", () => inputController.abort(), {
    once: true,
  });
  const inner = document.getElementById("inner");
  const launchingScript = document.getElementById("local config");

  if (!inner || !launchingScript) {
    console.log(
      "yeah no, calling that function by yourself would be annoying, trust me"
    );
    return;
  }
  removeSettingsMenu();

  const fragment = document.createDocumentFragment();
  span.innerHTML = "";
  span.className = `absolute top-0 size-full *:justify-self-center grid ${!tournament ? "grid-cols-3" : "grid-cols-4"}`;
  for (const playerId of [0, 1] as [0, 1]) {
    span.append(player_config(playerId));
  }
  fragment.append(span);
  button.className = `max-w-1/4 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 -translate-y-1/2`;
  button.textContent = findLanguage("launch game");
  button.onclick = () => {
    if (tournament && !startTournament()) return;
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
    launchingScript.remove();
  };
  fragment.append(button);
  label.textContent = "single game";
  label.className = `max-w-1/4 text-sm text-sm/6 leading text-white cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 translate-y-1/2`;
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "accent-sky-500 mx-1";
  label.append(input);
  fragment.append(label);
  button2.className = `max-w-1/4 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 ${!tournament ? "left-1/2" : "left-3/8"} transform -translate-x-1/2 translate-y-4/2`;
  button2.textContent = findLanguage(!tournament ? "tournament" : "classic");
  button2.onclick = () => {
    !tournament ? createTournament() : abortTournament();
    loadLocalConfig();
  };
  fragment.append(button2);
  if (tournament) {
    span.append(tournamentSelectionConfig());
  }
  inner.append(fragment);
}
self["loadLocalConfig"] = loadLocalConfig;
