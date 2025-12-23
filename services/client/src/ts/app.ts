var exports = {};
import {
  htmlSnippets,
  languageString,
  selectLanguage,
} from "./html/templates.js";
import {
  goToURL,
  keyExist,
  launchSinglePageApp,
  resetReconnectTimer,
} from "./utils.js";
import { sendMessage, setEvents } from "./html/events.js";
import { initPhysics } from "./physicsAcceuil.js";

/**
 * the infos we consider important that we get from a fetch to the server
 */
interface ServerResponse {
  template?: string;
  title?: string;
  replace?: { [key: string]: string | languageString };
  inner?: string;
  headers?: Headers;
}

let mainTemplate: string | null = null;
let mainInner: string | null = null;
/**
 * will cause a reload of the inner even without setting main with force to true
 */
export function resetNextInner() {
  mainInner = null;
}
self["resetNextInner"] = resetNextInner;

let last: ServerResponse | null = null;
/**
 * The main function of the Single-Page-Application:
 *  - fetch the website infos
 *  - set the UI accordingly
 * @param params.force if true change the app even if same as before, default as false. Prefer using resetNextInner
 * @param params.requests if false uses the last response received without fetching, default as true
 */
// btw no Syntax Errow throwed if params bad due to function working with 1 and 0 too, as well as "yay" and ""
export async function main(params?: {
  force?: boolean;
  requests?: boolean;
}): Promise<void> {
  const app = document.getElementById("app");
  if (!app) {
    console.error('We need an element (preferably a div) with id="app"');
    return;
  }

  const data =
    params?.requests === undefined || params.requests ? await fetchApi() : last;
  if (!data) {
    return;
  }
  {
    // if you want to have headers, make a new fetch -geymat
    let { headers, ...rest } = data;
    last = rest;
  }
  if (keyExist(data, "title")) {
    document.title = selectLanguage(data.title);
  }
  if (
    keyExist(data, "template") &&
    (data.template !== mainTemplate || params?.force)
  ) {
    mainTemplate = data.template;
    mainInner = null;
    changeSnippet(app, data["template"]);
  }
  const inner = document.getElementById("inner");
  if (
    inner &&
    keyExist(data, "inner") &&
    (data.inner != mainInner || params?.force)
  ) {
    mainInner = data.inner;
    changeSnippet(inner, data["inner"]);
  }
  const parent = document.getElementById("inner-buttons");
  if (parent) {
    toggleButtons(parent);
  }
  if (keyExist(data, "replace")) {
    replaceElements(data.replace);
  }
  if (keyExist(data, "headers")) {
    resetReconnectTimer(data.headers.get("x-authenticated"));
  } else if (!localStorage.getItem("token")) {
    resetReconnectTimer("false");
  }
  setEvents();
  // (window as any).loginWithGithub = loginWithGithub;
  // initPhysics();
}
self["main"] = main;

/**
 * Fetchs the api page corresponding to the current page
 * @returns a ServerResponse for main (or null on critical error)
 */
async function fetchApi(): Promise<ServerResponse> {
  try {
    const response = await fetch(
      `/api/page${encodeURI(self.location.pathname)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (
      (response.status >= 500 && response.status < 600) ||
      !response.headers.has("content-type") ||
      !response.headers.get("content-type").startsWith("application/json")
    ) {
      return {
        template: "Home",
        replace: { "container-iframe": await response.text() },
        title: `${response.status} ${response.statusText}`,
        inner: "Ouch",
        headers: response.headers,
      };
    }
    const data = (await response.json()) as ServerResponse;
    data.headers = response.headers;
    return data;
  } catch (error) {
    sendMessage(error instanceof Error ? error.message : String(error));
    return {};
  }
}

/**
 * used to set the innerHTML of elem by an html snippet
 * @param elem the element that will be changed
 * @param template a key for the object htmlSnippets
 * @returns true if template found in htmlSnippets
 */
function changeSnippet(elem: HTMLElement, template: string): boolean {
  if (!keyExist(htmlSnippets, template)) {
    elem.innerHTML = "";
    elem.classList.add("text-white");
    elem.innerText = `Snippet ${template} not Found in template.js\nIf you didn't traficate your front-end files, consider refreshing and then calling @geymat, @gcros or @sjean`;
    return false;
  }
  elem.innerHTML = htmlSnippets[template];
  const scripts = elem.querySelectorAll("script");
  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");
    newScript.textContent = oldScript.textContent;
    [...oldScript.attributes].forEach((attr) =>
      newScript.setAttribute(attr.name, attr.value)
    );
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
  return true;
}

/**
 * toggle the attribute data-checked of the button,
 * true when button name is the same as location.pathname
 * @param parent The buttons' parent
 */
function toggleButtons(parent: HTMLElement) {
  const elements = parent.children;
  for (let i = 0; i < elements.length; i++) {
    const name = elements[i].getAttribute("name");
    elements[i].toggleAttribute(
      "data-checked",
      name !== null && `/${name}` === location.pathname + location.search
    );
  }
}

/**
 * tries finding HTML elements and change (stop when one worked) either
 * their attribute value, srcdoc or their innertext
 * @param toReplace toReplace[key] = val — 'key' are the id of the elements selected, 'val' are the new values
 */
function replaceElements(toReplace: {
  [key: string]: string | languageString;
}): void {
  for (const key in toReplace) {
    let element = document.getElementById(key);
    if (element) {
      if (element.hasAttribute("value")) {
        // for <input>
        element.setAttribute("value", selectLanguage(toReplace[key]));
      } else if (element.hasAttribute("srcdoc")) {
        // for <iframe>
        element.setAttribute("srcdoc", selectLanguage(toReplace[key]));
      } else if (element.hasAttribute("src")) {
        // for <iframe>
        element.setAttribute("src", selectLanguage(toReplace[key]));
      } else if (element.tagName === "TEXTAREA") {
        // when <br> doesn't work
        element.textContent = selectLanguage(toReplace[key]);
      } else {
        element.innerText = selectLanguage(toReplace[key]);
      }
    }
  }
}

launchSinglePageApp();
