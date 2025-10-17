var exports = {};
import { htmlSnippets } from "./templates.js"
import { goToURL, keyExist, launchSinglePageApp, resetReconnectTimer } from "./utils.js";
import { setEvents } from "./events.js";

/**
 * the infos we consider important that we get from a fetch to the server
 */
interface ServerResponse {
  template?: string,
  title?: string,
  replace?: {[key: string]: string},
  inner?: string,
  headers?: Headers,
}

let mainTemplate: string | null = null;
let mainInner: string | null = null;
/**
 * The main function of the Single-Page-Application:
 *  - fetch the website infos
 *  - set the UI accordingly
 */
export async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) {
    console.error('We need an element (preferably a div) with id="app"');
    return;
  }

  const data = await fetchApi();
  if (!data) {
    return;
  }
  if (keyExist(data, 'title')) {
    document.title = data.title;
  }
  if (keyExist(data, 'template') && data.template !== mainTemplate) {
    mainTemplate = data.template;
    mainInner = null;
    changeSnippet(app, data['template']);
  }
  const inner = document.getElementById('inner');
  if (inner && keyExist(data, 'inner') && data.inner != mainInner) {
    mainInner = data.inner;
    changeSnippet(inner, data['inner']);
  }
  const parent = document.getElementById('inner-buttons');
  if (parent){
    toggleButtons(parent);
  }
  if (keyExist(data, "replace")) {
    replaceElements(data.replace);
  }
  if (keyExist(data, 'headers')) {
    resetReconnectTimer(data.headers.get('x-authenticated'));
  }
  setEvents();
}
window["main"] = main;

/**
 * Fetchs the api page corresponding to the current page
 * @returns a ServerResponse for main (or null on critical error)
 */
async function fetchApi(): Promise<ServerResponse> {
  try {
    const response = await fetch(`${window.location.origin}/api${window.location.pathname}`);
    if (response.status >= 500 && response.status < 600
      || !(response.headers.has('content-type'))
      || !response.headers.get("content-type").startsWith("application/json")) {
      return {template: "Home",
        replace: {"container-iframe": await response.text()},
        title: `${response.status} ${response.statusText}`,
        inner: "Ouch",
        headers: response.headers,
      };
    }
    const data = await response.json() as ServerResponse;
    data.headers = response.headers;
    return data;
  } catch (error) {
    alert(error instanceof Error ? error.message : String(error));
    return null;
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
    elem.innerText = `Snippet ${template} not Found in template.js`;
    return false;
  }
  elem.innerHTML = htmlSnippets[template];
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
    elements[i].toggleAttribute("data-checked",
      name !== null && (`/${name}` === location.pathname));
  }
}

/**
 * tries finding HTML elements and change (stop when one worked) either 
 * their attribute value, srcdoc or their innertext 
 * @param toReplace toReplace[key] = val — 'key' are the id of the elements selected, 'val' are the new values
 */
function replaceElements(toReplace: {[key:string]:string}): void {
  for (const key in toReplace) {
    let element = document.getElementById(key);
    if (element) {
      if (element.hasAttribute("value")) { // for <input>
        element.setAttribute("value", toReplace[key]);
      } else if (element.hasAttribute("srcdoc")) { // for <iframe>
        element.setAttribute("srcdoc", toReplace[key]);
      } else if (element.tagName === "TEXTAREA") { // when <br> doesn't work
        element.textContent = toReplace[key];
      } else {
        element.innerText = toReplace[key];
      }
    }
  }
}

launchSinglePageApp();
