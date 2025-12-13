// This file is like events.ts except it's about <script>function()<script>
// events.ts was too full when the top function was not acting as an index

import { resetNextInner } from "../app.js";
import { encodeURIUsername, goToURL } from "../utils.js";
import { assetsPath, findLanguage, selectLanguage } from "./templates.js";

/**
 * will try to load a game history if a player when whatching their profile
 */
function loadGameHistory(): void {
  resetNextInner();
  const tbody = document.getElementById("history-tbody");
  const pathname = location.pathname.replace(/\/$/, "");
  let username = decodeURIComponent(
    pathname.substring(pathname.lastIndexOf("/") + 1)
  );
  if (!tbody) return;
  fetch(`/api/misc/history?user=${encodeURIComponent(username)}`)
    .then((res) => res.json())
    .then((json) => {
      if (!json.length) {
        // tbody.innerHTML = `<tr class="*:border *:border-gray-300 *:text-center"><td></td><td></td><td></td></tr>`;
        // tbody.firstElementChild.lastElementChild.textContent =
        //   findLanguage("never played");
        return;
      }
      const fragment = document.createDocumentFragment();
      for (let game of json) {
        const div = document.createElement("div");
        div.className =
          "rounded-2xl border border-gray-200 p-3 bg-[#1E244F] grid grid-cols-1 sm:grid-cols-3 gap-4 my-2";
        for (let result of ["winner", "loser"]) {
          const d = document.createElement("div");
          d.className =
            "cursor-pointer flex flex-row items-center justify-center gap-2 hover:text-bold";
          const span = document.createElement("span");
          if (game[result] === null) {
            span.textContent = findLanguage("deleted");
            span.className = "text-red-300 cursor-not-allowed";
            d.append(span);
            div.append(d);
            continue;
          }
          const img = document.createElement("img");
          img.className = "size-8 aspect-square rounded-full";
          img.src = `/resources/pfp/${game[result + "_pfp"]}`;
          d.append(img);
          if (game[result] !== username) {
            span.className = "text-white hover:text-bold";
            span.addEventListener("click", () =>
              goToURL(`/profile/${encodeURIUsername(game[result])}`)
            );
          } else {
            span.className = "text-white";
          }
          span.textContent = game[result];
          d.append(span);
          div.append(d);
        }
        const d = document.createElement("div");
        const span = document.createElement("span");
        d.className = "flex items-center justify-center";
        span.className = "text-white";
        const time = new Date(game.time);
        span.textContent = `${time.getHours()}:${time.getMinutes()} ${time.getDate()}/${
          time.getMonth() + 1
        }/${time.getFullYear()}`;
        d.title = "HH:MM DD/MM/YYYY";
        d.append(span);
        div.append(d);
        fragment.appendChild(div);
      }
      tbody.innerHTML = "";
      tbody.appendChild(fragment);
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

  if (grid === null && span === null) {
    return;
  }
  {
    let params = new URLSearchParams(location.search);
    page = 1;
    if (params.has("page")) {
      page = parseInt(params.get("page"), 10);
      if (!isFinite(page) || page < 1) page = 1;
    }
  }
  try {
    const res = await fetch(`/api/misc/friends${location.search}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.status != 200) {
      if (grid) {
        if (grid.firstElementChild)
          grid.firstElementChild.textContent = selectLanguage([
            "error occured",
            String(res.status),
          ]);
      }
      return;
    }
    const json = await res.json();
    if (json[0] <= 16 * (page - 1)) {
      page = Math.floor(json[0] / 16) + 1;
    }
    if (span !== null && span.childElementCount === 3) {
      span.children[0].toggleAttribute("hidden", page === 1);
      span.children[1].textContent = String(page);
      span.children[2].toggleAttribute("hidden", json[0] <= page * 16);
    }
    if (grid !== null) {
      if (json[0] === 0) {
        grid.innerHTML =
          '<p class="col-span-full row-span-full m-auto text-white"></p>';
        grid.firstElementChild.textContent = findLanguage("get friends");
        return;
      }
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < json[1].length && i < 16; i++) {
        const div = document.createElement("div");
        div.className =
          "size-full border-3 hover:bg-gray-700 border-gray-950 flex items-center overflow-hidden justify-around cursor-pointer";
        div.addEventListener("click", () =>
          goToURL(`/profile/${encodeURIUsername(json[1][i].username)}`)
        );
        const p = document.createElement("p");
        p.className = "text-gray-300";
        p.textContent = json[1][i].username;
        const img = document.createElement("img");
        img.src = `${assetsPath}/pfp/${json[1][i].pfp}`;
        img.className = "h-10 aspect-square rounded-full";
        div.append(p, img);
        fragment.append(div);
      }
      grid.innerHTML = "";
      grid.appendChild(fragment);
    }
  } catch (err) {
    console.error(err);
  }
}
self["loadFriendsDisplay"] = loadFriendsDisplay;

/**
 * moves the page for the function loadFriendsDisplay
 * @param direction the moving of the page, relative to the current page (1 to move right, -1 to move left)
 */
function moveFriendsDisplay(direction: number): void {
  if (typeof direction !== "number")
    throw new TypeError('"direction" must be a Finite number');
  if (direction === 0) return;
  page = page + Math.max(direction, 1 - page);
  history.pushState(
    { page: "" },
    "",
    `/friends${page !== 1 ? `?page=${page}` : ""}`
  );
  if (direction === 0 || (page === 1 && direction < 0)) return;
  console.log(page);
  loadFriendsDisplay();
}
self["moveFriendsDisplay"] = moveFriendsDisplay;
