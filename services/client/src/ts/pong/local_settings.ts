
import { createLocalPong } from "./engine/engine_game.js";
import { keyControl } from "./engine/engine_interfaces.js";
import { players } from "./engine/engine_variables.js";
import { updateLocalGame } from "./pong.js";


let controller = new AbortController();
function changeInput(e: MouseEvent, which: "down" | "up", player_id: 0 | 1) {
  controller.abort();
  controller = new AbortController();
  controller.signal.addEventListener("abort", () => ((e.target as Element).textContent = players[player_id][which].key));
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    players[player_id][which].key = e.key;
    players[player_id][which].code = e.code;
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
      console.log("it's", `${player_id}_${which ? "down": "up" }`);
      res[which] = JSON.parse(localStorage.getItem(`${player_id === "player_one" ? 0 : 1}_${which ? "down": "up" }`) || "crash");
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
function set_key_config(player_id: 0 | 1, which: "down" | "up", controls: keyControl) {
  players[player_id][which] = controls;
  localStorage.setItem(`${player_id}_${which}`, JSON.stringify(controls));
}

/**
 * gives a HTML element 
 * @param player_id the string value of the key corresponging to the player in config
 */
function player_config(player_id: 0 | 1) {
  controller.abort();
  const div = document.createElement("div");
  div.className = "flex flex-col justify-around h-3/4 my-auto border w-3/4 *:size-fit *:mx-auto rounded bg-gray-600";
  if (players[player_id].bot_difficulty) {
    const button = document.createElement("button");
    button.textContent = "add player ?";
    button.className = "text-white border border-black rounded px-1 cursor-pointer";
    button.onclick = () => {
      players[player_id].bot_difficulty = 0;
      loadLocalConfig();
    };
    div.appendChild(button);
    const span = document.createElement("span");
    span.className = "flex flex-col *:size-fit place-items-center";
    const label = document.createElement("label");
    label.textContent = "Difficulty 1 - 4";
    label.title = "Formula: starts predicting the ball when it is ≪((difficulty + 1) ** 3 * 0.8)% size of the board≫ close to you";
    label.className = "whitespace-pre-line px-3";
    span.appendChild(label);
    const range = document.createElement("input");
    range.type = "range";
    range.min = "1";
    range.max = "4";
    range.value = String(players[player_id].bot_difficulty);
    range.oninput = e => players[player_id].bot_difficulty = parseInt((e.target as HTMLInputElement).value);
    span.appendChild(range);
    div.appendChild(span);
    return div;
  }
  const p = document.createElement("p");
  p.textContent = player_id ? "right player" : "left player";
  p.className = "text-white";
  div.appendChild(p);
  const up = document.createElement("button");
  console.log(players);
  up.textContent = players[player_id].up.key;
  up.className = "text-white border border-black rounded px-1 cursor-pointer";
  up.onclick = e => changeInput(e, "up", player_id);
  div.appendChild(up);
  const down = document.createElement("p");
  down.textContent = players[player_id].down.key;
  down.className = "text-white border border-black rounded px-1 cursor-pointer";
  down.onclick = e => changeInput(e, "down", player_id);
  div.appendChild(down);
  const button = document.createElement("button");
  button.textContent = "set a bot";
  button.className = "text-white border border-black rounded px-1 cursor-pointer";
  button.onclick = () => {
    players[player_id].bot_difficulty = 10;
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
  // below is in case we change page while changing keyboard config (the "Listen..." period) 
  self.addEventListener("popstate", e => controller.abort(), {once: true});
  const inner = document.getElementById("inner");
  const proof = document.getElementById("local config");
  // will be used to set a pop-up without looking like one

  if (!inner || !proof) {
    console.log("yeah no, calling that function by yourself would be annoying, trust me");
    return;
  }

  if (inner.contains(span)) inner.removeChild(span);
  if (inner.contains(button)) inner.removeChild(button);

  const fragment = document.createDocumentFragment();
  span.innerHTML = "";
  span.className = "absolute top-0 size-full *:justify-self-center gap-30 grid grid-cols-2"
  for (const player_id of [0 , 1] as [0 , 1]) {
    span.appendChild(player_config(player_id))
  }

  fragment.appendChild(span);
  button.className = "max-w-30 bg-gray-500 border cursor-pointer rounded px-1 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
  button.textContent = "launch game";
  button.onclick = () => {
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