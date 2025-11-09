
// This file is like events.ts except it's about <script>function()<script>
// events.ts was too full when the top function was not acting as an index

import { encodeURIUsername, goToURL } from "../utils.js";
import { sendMessage } from "./events.js";
import { assetsPath, findLanguage } from "./templates.js";

/**
 * will try to load a game history if a player when whatching their profile
 */
function loadGameHistory(): void {
  const tr = document.getElementById("history-tbody");
  let username = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
  if (!tr)
    return ;
  tr.innerHTML = "";
  fetch(`/misc/history?user=${username}`)
    .then(res => res.json())
    .then(json => {
    if (!json.length) tr.innerHTML += `<tr class="*:border *:border-gray-300 *:text-center"><td></td><td></td><td>${findLanguage("never played")}</td></tr>`;
    for (let game of json)
      tr.innerHTML += `
        <tr class="*:border *:border-gray-300 *:text-center">
          <td ${game.winner !== null ? `${game.winner !== username ? `class="cursor-pointer" onclick="goToURL('/profile/${encodeURIUsername(game.winner)}')` : ""}">${game.winner}`: `class="text-red-400">${findLanguage("deleted")}`}</td>
          <td ${game.loser !== null ? `${game.loser !== username ? `class="cursor-pointer" onclick="goToURL('/profile/${encodeURIUsername(game.loser)}')`: ""}">${game.loser}`: `class="text-red-400">${findLanguage("deleted")}`}</td>
          <td>${game.time}</td>
        </tr>
        `;
    })
    .catch((err) => console.error(err));
}
self["loadGameHistory"] = loadGameHistory;


let page = 1;
/**
 * fetch and display the information about the friends of the caller, depending on the current page from the query (friends?page=10)
 */
async function loadFriendsDisplay(): Promise<void> {
  const grid = document.getElementById("friends-grid") as HTMLDivElement;
  const span = document.getElementById("friends-span") as HTMLSpanElement;

  if (grid === null && span === null){
    return;
  }
  {
    let params = new URLSearchParams(location.search);
    if (params.has("page")) {
      page = parseInt(params.get("page"), 10);
      if (!isFinite(page) || page < 1)
        page = 1;
    }
  }
  try {
    const res = await fetch(`/misc/friends${location.search}`, {
      headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`},
    });
    const json = await res.json();
    if (json[0] <= 16 * (page - 1)) {
      page = Math.floor(json[0] / 16) + 1;
    }
    if (grid !== null) {
      grid.innerHTML = (json[0] === 0) ? `<p class="col-span-full row-span-full m-auto text-white">${findLanguage("get friends")}</p>` : "";
      for (let i = 0; i < json[1].length && i < 16; i++) {
        grid.innerHTML += `<div class="size-full border-3 border-gray-950 flex items-center overflow-hidden justify-around cursor-pointer" onclick="goToURL('/profile/${encodeURIUsername(json[1][i].username)}')"><p class="text-gray-300"></p></div>`;
        grid.lastElementChild.firstElementChild.textContent = json[1][i].username;
        grid.lastElementChild.innerHTML += `<img src="${assetsPath}/pfp/${json[1][i].pfp}" class="h-10 aspect-square rounded-full"/>`;
      }
    }
    if (span !== null && span.childElementCount === 3){
      span.children[0].toggleAttribute("hidden", page === 1);
      span.children[1].textContent = String(page);
      span.children[2].toggleAttribute("hidden", json[0] <= page * 16);
    }
  } catch (err) {
    sendMessage(String(err));
  }
}
self["loadFriendsDisplay"] = loadFriendsDisplay

/**
 * moves the page for the function loadFriendsDisplay
 * @param direction the moving of the page, relative to the current page (1 to move right, -1 to move left)
 */
function moveFriendsDisplay(direction: number): void {
  if (typeof direction !== 'number')
    throw new TypeError("\"direction\" must be a Finite number");
  if (direction === 0 || (page === 1 && direction < 0))
    return ;
  page = page + Math.max(direction, 1 - page);
  history.pushState({page: ""}, "",(`/friends${page !== 1 ? `?page=${page}` : ""}`));
  loadFriendsDisplay();
}
self["moveFriendsDisplay"] = moveFriendsDisplay;