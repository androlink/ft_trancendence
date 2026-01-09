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
      if (["Space", "AltLeft", "AltRight", "ContextMenu", "Escape"].includes(e.code)) {
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
  (e.target as Element).textContent = findLanguage("listen");
}

/**
 * gives a key config from the local storage
 * @param playerId the string value of the key corresponging to the player in config
 */
export function getKeyConfig(
  playerId: "player_one" | "player_two"
): [keyControl, keyControl] {
  const defaultConfig = {
    player_one: [{ key: "ArrowUp" }, { key: "ArrowDown" }] as [keyControl, keyControl],
    player_two: [{ key: "w" }, { key: "s" }] as [keyControl, keyControl],
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
  div.className = `flex flex-col h-3/4 my-auto min-h-[420px] border border-white w-3/4 *:size-fit *:mx-auto rounded-md bg-[#171C3D] ${
    playerId === 0 ? "col-start-1" : "col-start-3"
  }`;

  const isBot =
  players[playerId].up.key === undefined ||
  players[playerId].down.key === undefined;

  const iconPath = isBot ? "/resources/Bot.svg" : "/resources/Human.svg";

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "flex flex-col items-center justify-center gap-2 mt-8";

  let placeholder = document.createElement("p");
  placeholder.style.height = "80px";
  placeholder.innerHTML = "ㅤ"
  div.append(placeholder);
  fetch(iconPath)
    .then((res) => res.text())
    .then((svgText) => {
      const template = document.createElement("template");
      template.innerHTML = svgText;
      const svg = template.content.querySelector("svg");
      svg.classList.add("size-10", "self-center", "text-white");
      iconWrapper.append(svg);
      const div = document.createElement("div");
      div.className = "text-white text-center font-bold text-2xl";
      div.textContent = isBot ? findLanguage("bot title") : findLanguage("player title");
      placeholder.remove();
      iconWrapper.append(div);
    }
  ).catch(console.error);

  div.append(iconWrapper);

  const content = document.createElement("div");
  content.className = "flex flex-col flex-1 justify-around items-center";

  if (isBot) {
    const button = document.createElement("button");
    button.textContent = findLanguage("add player");
    button.className =
      "text-white border border-black bg-purple-600 hover:bg-blue-500 rounded p-1 cursor-pointer";
    button.onclick = () => {
      players[playerId].view.name = ["player", playerId ? "2" : "1"];
      const config = getKeyConfig(playerId ? "player_two" : "player_one");
      players[playerId].up = config[0];
      players[playerId].down = config[1];
      loadLocalConfig();
    };
    // difficulty below (until return)
    content.append(button);
    const span = document.createElement("span");
    span.className = "flex flex-col *:size-fit place-items-center";
    const label = document.createElement("label");
    label.textContent = findLanguage("difficulty");
    label.title = findLanguage("pong formula");
    label.className = " text-white whitespace-pre-line px-3";
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
    label_value.className = "text-white";
    function updateLabel() {
      const difficulty = range.value;
      label_value.textContent =
      parseFloat(difficulty) < 4 ? difficulty : findLanguage("wall");
    }
    updateLabel();
    range.oninput = updateLabel;
    span.append(range);
    span.append(label_value);
    content.append(span);
    div.append(content);
    return div;
  }
  // so we have a plyer, not a bot
  if (!tournament) {
    // player name selector
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
    input.className =
      "text-white text-center border border-gray-400 focus:border-blue-400 outline-none rounded p-1";
    content.append(input);
  } else {
    // player left or right indicator
    const text = document.createElement("text");
    text.textContent = selectLanguage([
      "player",
      !playerId ? ["left"] : ["right"],
    ]);
    text.className = "text-center text-white px-1";
    content.append(text);
  }
  for (let i = 0; i < 2; i++) {
    // keys selection
    const button = document.createElement("button");
    button.textContent = i ? players[playerId].down.key : players[playerId].up.key;
    button.className = "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = (e) => changeInput(e, ["up","down" ][i] as "down" | "up", playerId);
    const label = document.createElement("label");
    label.textContent = ["⬆️", "⬇️"][i];
    const span = document.createElement("span");
    span.className = "flex size-fit gap-2";
    span.append(label);
    span.append(button);
    content.append(span);
  }
  if (!tournament) {
    // bot selection button
    const button = document.createElement("button");
    button.textContent = findLanguage("add bot");
    button.className =
      "text-white border border-black rounded-md bg-purple-600 hover:bg-blue-500 text-white p-1 cursor-pointer";
    button.onclick = () => {
      players[playerId].view.name = [
        "bot",
        String(players[playerId].bot_difficulty),
      ];
      players[playerId].up = {};
      players[playerId].down = {};
      loadLocalConfig();
    };
    content.append(button);
  }
  div.append(content);
  return div;
}

/** the span of inputs */
const span = document.createElement("span");
/** the button to launch the game */
const button = document.createElement("button");
/** the button to launch tournaments */
const button2 = document.createElement("button");

/**
 * removes all the HTML elements above of the DOM
 */
function removeSettingsMenu(): void {
  span.remove();
  button.remove();
  button2.remove();
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
  const title = document.getElementById("PONG TITLE");
  title.classList.remove("hidden");

  if (!inner || !launchingScript) {
    console.log(
      "yeah no, calling that function by yourself would be annoying, trust me"
    );
    return;
  }
  removeSettingsMenu();

  const fragment = document.createDocumentFragment();
  span.innerHTML = "";
  span.className = `absolute top-0 size-full *:justify-self-center grid pointer-events-none **:pointer-events-auto ${
    !tournament ? "grid-cols-3" : "grid-cols-4"
  }`;
  for (const playerId of [0, 1] as [0, 1]) {
    span.append(player_config(playerId));
  }
  fragment.append(span);
  button.className = `max-w-1/4 bg-purple-600 hover:bg-blue-500 border border-black text-white text-lg shadow-2xl cursor-pointer rounded p-1 absolute top-1/2 ${
    !tournament ? "left-1/2" : "left-3/8"
  } transform -translate-x-1/2 -translate-y-1/2`;
  button.textContent = findLanguage("launch game");
  button.onclick = () => {
    title.classList.add("hidden");
    if (tournament && !startTournament()) return;
    sendMessage(
      selectLanguage([
        "game presentation",
        players[0].view.name,
        players[1].view.name,
      ])
    );
    createLocalPong();
    removeSettingsMenu();
    updateGameAnimation();
    launchingScript.remove();
  };
  fragment.append(button);
  button2.className = `max-w-1/4 bg-purple-600 hover:bg-blue-500 border border-black text-white text-lg shadow-2xl cursor-pointer rounded p-1 absolute top-1/2 ${
    !tournament ? "left-1/2" : "left-3/8"
  } transform -translate-x-1/2 translate-y-1/2`;
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
