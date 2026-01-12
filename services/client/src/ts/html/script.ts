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
      if (!json.length) return;
      const fragment = document.createDocumentFragment();
      for (let game of json) {
        const div = document.createElement("div");
        div.className =
          "rounded-2xl border border-gray-200 p-3 bg-[#1E244F] grid grid-cols-1 sm:grid-cols-3 gap-4 my-2";
        for (let result of ["winner", "loser"]) {
          if (result === "winner" && game[result] === username)
            div.className =
              "rounded-2xl border border-[#96DF9F] p-3 bg-[#335c49] grid grid-cols-1 sm:grid-cols-3 gap-4 my-2";
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
          const imgSlot = document.createElement("div");
          imgSlot.className =
            "rounded-full overflow-hidden  border border-gray-600 w-8 h-8 flex-shrink-0";
          const img = document.createElement("img");
          img.className = "object-center object-cover w-full h-full";
          img.src = `/resources/pfp/${game[result + "_pfp"]}`;
          imgSlot.append(img);
          d.append(imgSlot);
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
    if (json[0] <= 32 * (page - 1)) {
      page = Math.floor(json[0] / 32) + 1;
    }
    if (span !== null && span.childElementCount === 3) {
      span.children[0].toggleAttribute("hidden", page === 1);
      span.children[1].textContent = String(page);
      span.children[2].toggleAttribute("hidden", json[0] <= page * 32);
    }
    if (grid !== null) {
      if (json[0] === 0) {
        const div = grid.parentElement;
        div.classList.add("m-auto", "text-white");
        div.classList.remove("flex-1");
        // div.innerHTML =
        //   '<p class="col-span-full row-span-full items-center m-auto text-white"></p>';
        div.textContent = findLanguage("get friends");
        grid.classList.add("hidden");
        return;
      }
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < json[1].length && i < 32; i++) {
        const div = document.createElement("div");
        div.className =
          "size-full border hover:bg-blue-200/10 border-gray-200 rounded-xl shadow-xl flex items-center overflow-hidden justify-around cursor-pointer gap-4 px-4 py-2";
        div.addEventListener("click", () =>
          goToURL(`/profile/${encodeURIUsername(json[1][i].username)}`)
        );
        const p = document.createElement("p");
        const d = document.createElement("div");
        const imgSlot = document.createElement("div");
        p.className = "text-gray-300 truncate flex-grow";
        p.textContent = json[1][i].username;
        const img = document.createElement("img");
        const status = document.createElement("div");
        img.src = `${assetsPath}/pfp/${json[1][i].pfp}`;
        d.className = "relative";
        imgSlot.className =
          "rounded-full overflow-hidden  border-2 border-gray-600 w-15 h-15 flex-shrink-0";
        img.className = "object-center object-cover w-full h-full";
        status.className = `absolute w-5 h-5 bottom-0 left-0 flex border-2 ${
          json[1][i].status
            ? "bg-green-400 border-green-800"
            : "bg-gray-600 border-[#171C3D]"
        } rounded-full`;
        imgSlot.append(img);
        d.append(imgSlot);
        d.append(status);
        div.append(d, p);
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
  if (direction === 0 || (page === 1 && direction < 0)) return;
  page = page + Math.max(direction, 1 - page);
  history.pushState(
    { page: "" },
    "",
    `/friends${page !== 1 ? `?page=${page}` : ""}`
  );
  loadFriendsDisplay();
}
self["moveFriendsDisplay"] = moveFriendsDisplay;
