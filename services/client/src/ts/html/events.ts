import {
  encodeURIUsername,
  goToURL,
  keyExist,
  resetReconnectTimer,
} from "../utils.js";
import {
  htmlSnippets,
  findLanguage,
  selectLanguage,
  assetsPath,
  setLanguage,
} from "./templates.js";
import { main, resetNextInner } from "../app.js";
import {
  sendChatMessage,
  InitConnectionChat,
  sendStatusMessage,
  ChatHistoryRequest,
  ChatResetHistoryLine,
} from "../chat.js";

/**
 * set all the events that the page need to work properly
 */
export function setEvents(): void {
  const events = {
    "chat-input": setEventChat,
    "user-search": setMultipleEventUsername,
    "pfp-form": setSubmitEventPfp,
    "log-in-form": setSubmitEventLogIn,
    "register-form": setSubmitEventRegister,
    "blocking request": setClickEventBlockRequest,
    "friend request": setClickEventFriendRequest,
    "profile-form": setSubmitEventProfile,
    "pfp-input": setChangeEventPfpInput,
    "go-to-profile": setClickEventProfile,
    "change-password-form": setSubmitEventPassword,
    "delete-account-form": setSubmitEventDelete,
    "language-selector": setChangeEventLanguageSelector,
  };
  for (const id in events) {
    const elem = document.getElementById(id);
    if (elem && !elem.hasAttribute("data-custom")) {
      events[id](elem);
      elem.toggleAttribute("data-custom", true);
    }
  }
}

/**
 * it will try to write the error on the last child of the element if named "error-handler.
 * Else, alert()
 * @param form the form element
 * @param message the error that will be shown
 */
function displayErrorOrAlert(form: HTMLFormElement, message: string): void {
  try {
    const child = form.lastElementChild;
    if (child && child.getAttribute("name") === "error-handler") {
      child.textContent = message;
      return;
    }
    const template = document.createElement("template");
    template.innerHTML = htmlSnippets["ErrorMessageHandler"];
    const handler = template.content.firstElementChild as HTMLParagraphElement;
    if (handler === null) {
      alert(message);
      return;
    }
    handler.innerText = message;
    form.appendChild(handler);
  } catch (error) {
    alert(`${message}\nAlso: ${error}`);
  }
}

function needConnection(form: HTMLFormElement): boolean {
  if (localStorage.getItem("token") === null) {
    displayErrorOrAlert(form, "You are not connected");
    return false;
  }
  return true;
}

/**
 * used by the log in form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventPfp(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/account/pfp", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        method: "PUT",
        body: formData,
      });

      document.getElementById("update-pfp")?.toggleAttribute("hidden", true);
      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      resetNextInner();
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

function setSubmitEventLogIn(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const response = await fetch("api/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      sendStatusMessage();
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the Password change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventRegister(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      if (password !== (formData.get("password-confirm") as string)) {
        displayErrorOrAlert(form, findLanguage("passwords don't match"));
        return;
      }
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      sendStatusMessage();
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the Profile form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventProfile(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    if (needConnection(form) === false) return;
    const formData = new FormData(form);
    try {
      const username = formData.get("username") as string;
      const response = await fetch("/api/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: new URLSearchParams({
          username: username,
          biography: formData.get("biography") as string,
        }),
      });

      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      goToURL(`profile/${encodeURIUsername(username)}`);
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the Passwrd change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventPassword(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    if (needConnection(form) === false) return;
    const formData = new FormData(form);
    try {
      const password = formData.get("password") as string;
      if (password !== (formData.get("password-confirm") as string)) {
        displayErrorOrAlert(form, findLanguage("passwords don't match"));
        return;
      }

      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: new URLSearchParams({
          password: password,
        }),
      });

      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      const elem = document.getElementById("username-p1");
      if (elem && elem.hasAttribute("value"))
        goToURL(`profile/${encodeURIUsername(elem.getAttribute("value"))}`);
      else goToURL();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

function setSubmitEventDelete(form: HTMLFormElement): void {
  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    if (needConnection(form) === false) return;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: new URLSearchParams({
          username: formData.get("username") as string,
        }),
      });

      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        displayErrorOrAlert(
          form,
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
        return;
      }
      sendStatusMessage();
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the button that goes to the public profile from /profile
 * @param text the HTMLElement that's gonna get the event
 */
function setClickEventProfile(text: HTMLElement): void {
  const usernameElem = document.getElementById("username-p1");
  if (!usernameElem || !usernameElem.hasAttribute("value")) return;
  const username: string = usernameElem.getAttribute("value");
  text.parentElement.addEventListener("click", (event: PointerEvent) =>
    goToURL(`profile/${encodeURIUsername(username)}`)
  );
}

function setClickEventBlockRequest(text: HTMLElement): void {
  if (["NOT_CONNECTED", "IT_IS_YOU"].map(findLanguage).includes(text.innerText))
    return;
  text.className = "cursor-pointer";
  let username = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1
  );
  text.addEventListener("click", async (event: PointerEvent) => {
    try {
      const response = await fetch(`/api/account/block?user=${username}`, {
        method: "post",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        console.error(
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
      }
    } catch (error) {
      console.error(String(error));
    }
    resetNextInner();
    main();
  });
}

function setClickEventFriendRequest(text: HTMLElement): void {
  if (
    ["NOT_CONNECTED", "IT_IS_YOU", "THEY_ARE_BLOCKED"]
      .map(findLanguage)
      .includes(text.innerText)
  )
    return;
  text.className = "cursor-pointer";
  let username = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1
  );
  text.addEventListener("click", async (event: PointerEvent) => {
    try {
      const response = await fetch(`/api/account/friend?user=${username}`, {
        method: "post",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      resetReconnectTimer(response.headers.get("x-authenticated"));
      const result: { success?: boolean; message?: string } =
        await response.json();
      if (!result.success) {
        console.error(
          keyExist(result, "message")
            ? selectLanguage(result.message)
            : `${findLanguage("server answered")} ${response.status} ${
                response.statusText
              }`
        );
      }
    } catch (error) {
      console.error(String(error));
    }
    resetNextInner();
    main();
  });
}

/**
 * used by the chat input, send message on enter
 * @param textarea the said chat input element
 */
function setEventChat(textarea: HTMLTextAreaElement): void {
  InitConnectionChat();
  textarea.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
      ChatResetHistoryLine();
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const msg = ChatHistoryRequest(event.key === "ArrowDown" ? "down" : "up");
      textarea.value = msg ? msg : "";
    }
  });
}

/**
 * to add a new message to the chat.
 * Made it better than just taking one single string for debugging purpose (it sucks keep using console.log)
 *
 * sent to the console, so no translation done
 *
 * NOT DEFINITIVE,
 * NEED TO ADD SOCKETS,
 * ONLY THERE (for now) TO TEST THE APPEARANCE
 *
 * @param ...args anything that will be send to chat, separated by ", "
 * @returns true if the user has "seen" the message.
 * For instance to make a notif system.
 */
export function sendMessage(...args: any[]): boolean {
  let message = args.join(", ");
  if (!message) {
    console.error(`message not sent BECAUSE NOTHING TO SEND`);
    return false;
  }
  const chat = document.getElementById("chat-content");
  if (!chat) {
    console.error(
      `message '${message}' not sent to the chat because the chat is not found`
    );
    return false;
  }
  let scroll = chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1;
  // true if at the end of the chat
  const para = document.createElement("p");
  const node = document.createTextNode(message);
  para.appendChild(node);
  chat.appendChild(para);
  if (scroll) {
    chat.scrollTop = chat.scrollHeight;
  }
  if (chat.childElementCount > 1000) {
    // we have to remove by an even (% 2) amount due to CSS even and odd colors
    chat.firstElementChild?.remove();
    chat.firstElementChild?.remove();
  }
  return scroll;
}
self["sendMessage"] = sendMessage;

/**
 * Used by the username input at the top of the UI.
 * Preferably NOT DEFINITIVE (annoying to use)
 * @param textarea the said username input
 */
function setMultipleEventUsername(textarea: HTMLInputElement): void {
  function clearSibling() {
    const div = textarea.nextElementSibling as HTMLDivElement;
    if (div) div.innerHTML = "";
    first = null;
    return div;
  }
  let first: string | null = null;
  textarea.toggleAttribute("data-custom", true);
  textarea.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && textarea.value) {
      event.preventDefault();
      goToURL(`profile/${encodeURIUsername(textarea.value)}`, true);
      textarea.value = "";
      clearSibling();
    }
    if (event.key === "Tab" && first !== null) {
      event.preventDefault();
      textarea.value = first;
      clearSibling();
    }
  });
  let searchController: AbortController | null = null;
  textarea.addEventListener("input", async (e) => {
    textarea.value = Array.from(
      textarea.value.matchAll(/[0-9a-zA-Z_-]/g),
      (m) => m[0]
    ).join("");
    try {
      if (searchController) searchController.abort(); // cancel previous request
      searchController = new AbortController();
      const res = await fetch(`/api/misc/users?start=${textarea.value}`, {
        signal: searchController.signal,
      });
      const json = await res.json();
      const div = clearSibling();
      if (!div) return;
      if (json[0]) first = json[0].username;
      const fragment = document.createDocumentFragment();
      for (let user of json) {
        const span = document.createElement("span");
        span.className =
          "flex flex-row cursor-pointer my-auto px-5 py-2 h-fit w-full gap-3 bg-[#1b1e38d0] hover:bg-[#ffffff7c] hover:text-white";
        span.addEventListener("pointerdown", () =>
          goToURL(`/profile/${encodeURIUsername(user.username)}`, true)
        );
        const imgSlot = document.createElement("div");
        const img = document.createElement("img");
        imgSlot.className =
          "rounded-full overflow-hidden border border-gray-600 w-5 h-5 flex-shrink-0";
        img.className = "object-center object-cover w-full h-full";
        img.src = `${assetsPath}/pfp/${user.pfp}`;
        imgSlot.append(img);
        const p = document.createElement("p");
        p.textContent = user.username;
        span.append(imgSlot, p);
        fragment.appendChild(span);
      }
      div.innerHTML = "";
      div.appendChild(fragment);
    } catch (err) {}
  });
  textarea.addEventListener("blur", async () => {
    clearSibling();
  });
}

function setChangeEventLanguageSelector(select: HTMLSelectElement): void {
  let lang = localStorage.getItem("language");
  if (lang === null) lang = "en";
  select.querySelector(`[value="${lang}"]`)?.toggleAttribute("selected", true);
  select.addEventListener("change", (e) => {
    localStorage.setItem("language", select.value);
    setLanguage();
    main({ force: true, requests: false });
  });
}

function setChangeEventPfpInput(input: HTMLInputElement) {
  input.addEventListener("change", (e) => {
    const file = input.files[0];
    if (!file) return;

    // Check MIME type
    if (!file.type.startsWith("image/")) {
      input.value = "";
      document
        .getElementById("pfp-preview-div")
        .toggleAttribute("hidden", true);
      const form = document.getElementById("pfp-form") as HTMLFormElement;
      if (form) displayErrorOrAlert(form, findLanguage("need image"));
      return;
    }
    const img = window.URL.createObjectURL(input.files[0]);
    const preview = document.getElementById("pfp-preview") as HTMLImageElement;
    if (preview && img) preview.src = img;
    resetNextInner();
    document.getElementById("pfp-preview-div")?.removeAttribute("hidden");
    document.getElementById("update-pfp")?.removeAttribute("hidden");
  });
}

/**
 * Used at the start of the app-launching, to keyboard shortcut
 * - control K will select (if present) the user-search
 * - control enter will select (if present) the chat-input
 * - control P will search for /profile or /profile/username instead of printing the page
 * ...
 */
export function setCtrlEventUsername(): void {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      const elem = document.getElementById(
        "user-search"
      ) as HTMLTextAreaElement;
      if (elem) {
        e.preventDefault();
        elem.select();
      }
    }
    const div = document.getElementById("account-disconnected");
    if (!div) return;
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "Enter" &&
      !div.checkVisibility()
    ) {
      const elem = document.getElementById("chat-input") as HTMLTextAreaElement;
      if (elem) {
        // might have to add if not hidden later
        e.preventDefault();
        elem.select();
      }
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      !e.shiftKey &&
      e.key.toLowerCase() === "p"
    ) {
      e.preventDefault();
      const elem = document.getElementById("username-p1");
      if (elem && elem.hasAttribute("value")) {
        goToURL(`profile/${encodeURIUsername(elem.getAttribute("value"))}`);
        return;
      }
      goToURL("profile");
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
      if (localStorage.getItem("token")) {
        e.preventDefault();
        fetch("/api/account/logout", { method: "POST" })
          .then((res) => {
            resetReconnectTimer(res.headers.get("x-authenticated"));
            sendStatusMessage();
            if (document.activeElement.id !== "user-search") main();
            else
              sendMessage(
                "You found a debug option, won't force a reload if user-search is selected"
              );
          })
          .catch((err) => alert("Caught: " + err));
      }
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "ArrowRight" || e.key === "ArrowLeft") &&
      !isPressed &&
      document.activeElement === document.body
    ) {
      const buttons = document.getElementById("inner-buttons");
      if (!buttons) return;
      const checked = buttons.querySelector("[data-checked]");
      let target: Element;
      if (checked) {
        target =
          e.key === "ArrowLeft"
            ? checked.previousElementSibling
            : checked.nextElementSibling;
        if (target === null)
          target =
            e.key === "ArrowLeft"
              ? buttons.lastElementChild
              : buttons.firstElementChild;
      } else {
        target =
          e.key === "ArrowLeft"
            ? buttons.firstElementChild
            : buttons.lastElementChild;
      }
      if (target !== null && target instanceof HTMLElement) {
        target.click();
        e.preventDefault();
      }
      return;
    }
  });

  const app = document.getElementById("app");
  const template = document.createElement("template");
  template.innerHTML = htmlSnippets["PopUp"];
  const help = template.content.firstElementChild;
  let isPressed = null;
  if (app && help) {
    document.addEventListener("keydown", (e) => {
      e.stopPropagation();
      // document active is set to body to not activate while using chat
      if (
        e.key === "?" &&
        !isPressed &&
        document.activeElement === document.body
      ) {
        help.innerHTML =
          "<p>" +
          findLanguage("pop_up_commands") +
          "<br>" +
          findLanguage("pop_up_shortcuts") +
          "<br>" +
          findLanguage("pop_up_keys") +
          "<br>" +
          "</p>";
        isPressed = e.code;
        app.appendChild(help);
      }
    });
    document.addEventListener("blur", (e) => {
      // it's for removing when leaving the page (changin website || changing app)
      if (isPressed) {
        isPressed = null;
        if (app.contains(help)) {
          app.removeChild(help);
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.code === isPressed) {
        isPressed = null;
        if (app.contains(help)) {
          app.removeChild(help);
        }
      }
    });
  }
}
