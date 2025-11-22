
import { createLocalPong } from "./engine/engine_game.js";
import { keyControl } from "./engine/engine_interfaces.js";
import { config, players } from "./engine/engine_variables.js";
import { updateLocalGame } from "./pong.js";


let controller = new AbortController();
function changeInput(e: MouseEvent, which: 0 | 1, player_id: "player_one" | "player_two") {
  controller.abort();
  controller = new AbortController();
  controller.signal.addEventListener("abort", () => ((e.target as Element).textContent = config[player_id][which].key));
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    config[player_id][which].key = e.key;
    config[player_id][which].code = e.code;
    set_key_config(player_id, which, {key: e.key, code: e.code})
    loadLocalConfig();
  }, {once: true, signal: controller.signal});
  (e.target as Element).textContent = "Listen...";
} 

/**
 * gives a key config from the local storage
 * @param player_id the string value of the key corresponging to the player in config
 */
export function get_key_config(player_id: "player_one" | "player_two"): [keyControl, keyControl] {
  const defaultConfig = {
    player_one: [ {key: 'w'}, {key: 's'} ] as [keyControl, keyControl],
    player_two: [ {key: 'o'}, {key: 'l'} ] as [keyControl, keyControl],
  };
  const res = [undefined, undefined] as [keyControl, keyControl];
  for (const which of [0, 1]) {
    try {
      res[which] = JSON.parse(localStorage.getItem(`${player_id}_${which}`) || "crash");
    }
    catch (err){
      res[which] = defaultConfig[player_id][which];
    }
  }
  return res;
}

/**
 * set a keyControl to the local storage
 * @param controls the keyControl you wanna remember
 */
function set_key_config(player_id: "player_one" | "player_two", which: 0 | 1, controls: keyControl) {
  players[player_id === "player_one" ? 0 : 1][which ? "down" : "up"] = controls;
  localStorage.setItem(`${player_id}_${which}`, JSON.stringify(controls));
}

/**
 * gives a HTML element 
 * @param player_id the string value of the key corresponging to the player in config
 */
function player_config(player_id: "player_one" | "player_two") {
  controller.abort();
  const div = document.createElement("div");
  div.className = "flex flex-col justify-around h-3/4 my-auto border w-3/4 *:size-fit *:mx-auto rounded bg-gray-600";
  if (config[player_id] === undefined) {
    const button = document.createElement("button");
    button.textContent = "add player ?";
    button.className = "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      config[player_id] = get_key_config(player_id);
      loadLocalConfig();
    };
    div.appendChild(button);
    return div;
  }
  const p = document.createElement("p");
  p.textContent = player_id;
  p.className = "text-white";
  div.appendChild(p);
  const up = document.createElement("button");
  up.textContent = config[player_id][0].key;
  up.className = "text-white border border-black rounded px-1 cursor-pointer";
  up.onclick = e => changeInput(e, 0, player_id);
  div.appendChild(up);
  const down = document.createElement("p");
  down.textContent = config[player_id][1].key;
  down.className = "text-white border border-black rounded px-1 cursor-pointer";
  down.onclick = e => changeInput(e, 1, player_id);
  div.appendChild(down);
  const button = document.createElement("button");
  button.textContent = "set a bot";
  button.className = "text-white border border-black rounded px-1 cursor-pointer";
  button.onclick = () => {
    config[player_id] = undefined;
    loadLocalConfig();
  };
  div.appendChild(button);
  return div;

}

/**
 * used to chose who will play with what when playing local
 * Display will be inspired of smash bros, kinda
 */
function loadLocalConfig() {
  // below is in case we change page while changing keyboard config (the "Listen..." period) 
  self.addEventListener("popstate", e => controller.abort(), {once: true});
  const inner = document.getElementById("inner");
  const proof = document.getElementById("local config");
  // will be used to set a pop-up without looking like one

  if (!inner || !proof) {
    console.log("yeah no, calling that function by yourself would be annoying, trust me");
    return;
  }

  const fragment = document.createDocumentFragment();
  const span = document.createElement("span");
  span.className = "absolute top-0 size-full *:justify-self-center gap-30 grid grid-cols-2"
  for (const player of ["player_one", "player_two"] as const ) {
    span.appendChild(player_config(player))
  }
  fragment.appendChild(span);
  const button = document.createElement("button");
  button.className = "max-w-30 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
  button.textContent = "launch game";
  button.onclick = () => {
    inner.removeChild(span);
    inner.removeChild(button);
    createLocalPong();
    updateLocalGame();
  };
  fragment.appendChild(button);
  inner.appendChild(fragment);
}
self["loadLocalConfig"] = loadLocalConfig;