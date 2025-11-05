
import { main } from "./app.js"
import { setCtrlEventUsername } from "./html/events.js";

//----------------------------------------------------------------------------#
//                                HISTORY STUFF                               #
//----------------------------------------------------------------------------#

/**
 * for moving page to page, used (not only) by html
 * await main() to anticipate the page changes
 * @param nextURL the page we wanna go to
 * @param force go to the page even if already on it, default to false
 * @returns true if main() is triggered, meaning the function was used
 */
export async function goToURL(nextURL: string = "", force: boolean = false): Promise<boolean> {
  if (arguments.length > 2) {
    throw new SyntaxError('expected 0 to 2 argument');
  }
  if (typeof nextURL !== 'string') {
    throw new TypeError(`first argument must be a string, not ${typeof nextURL}`);
  }
  if (typeof force !== 'boolean') {
    throw new TypeError(`second argument must be a boolean, not ${typeof force}`);
  }

  if (!nextURL.startsWith('/'))
    nextURL = `/${nextURL}`;
  if (!force && location.pathname === nextURL)
    return false;
  history.pushState({page: ""}, "", nextURL);
  await main();
  return true;
}
self["goToURL"] = goToURL;

/** 
 * reload the page when user touch history arrow buttons
 */
function setArrowButton() {
  self.addEventListener('popstate', () => main());
};

//----------------------------------------------------------------------------#
//                                  TIMER STUFF                               #
//----------------------------------------------------------------------------#

let reconnectTimer: ReturnType<typeof setTimeout>;
self["isConnected"] = false;

/**
 * sets a timer to tell you when you're gonna be disconnected soon
 * @param auth the header X-authenticated after a fresh request
 * @returns true if the timer got 14 more minutes
 */
export function resetReconnectTimer(auth: string | null): boolean {
  if (arguments.length !== 1) {
    throw new SyntaxError('expected 1 argument');
  }
  if (typeof auth !== 'string' && auth !== null) {
    throw new TypeError(`argument must be a string or null, not ${typeof auth}`);
  }

  if (auth === null) {
    return false;
  }

  let setVisibility = (id: string, state: boolean) => {
    const elem = document.getElementById(id);
    if (elem) elem.toggleAttribute("hidden", !state);
  };
  clearTimeout(reconnectTimer);
  setVisibility("account-reconnected", false);
  if (auth !== 'true') {
    setVisibility("account-disconnected", true);
    self["isConnected"] = false;
    return false;
  }
  setVisibility("account-disconnected", false);
  self["isConnected"] = true;
  reconnectTimer = setTimeout(
    () => {
      fetch('/api')
        .then(res => {
          if (resetReconnectTimer(res.headers.get('x-authenticated')))
            setVisibility("account-reconnected", true);
        })
        .catch(() => {}); // if it failed don't bother
    },
    14 * 60 * 1000
  );
  return true;
}

//----------------------------------------------------------------------------#
//                               PURELY COMFORT                               #
//----------------------------------------------------------------------------#

/**
 * launch the SPA at the end of loading
 * and set history control
 */
export function launchSinglePageApp() {
  console.log("Hello dear user.\n" +
    "Just so you know, this website rely heavily on javascript running in the front, " +
    "messing with it might cause a lot of 4XX errors and weird display inconsistencies " +
    "(example: a popup saying you are disconnected even tho you are not)\n" +
    "This been said, have fun breaking the website");
  document.addEventListener("DOMContentLoaded", () => {
    setArrowButton();
    main().catch(err => console.error(err));
    setCtrlEventUsername();
  });
  
}

/**
 * Check if object has the key to prevent crash,
 * easier to read than native js
 * @param object
 * @param key 
 * @returns Object.hasOwn(object, key);
 */
export function keyExist(object: object, key: PropertyKey) {
  return Object.hasOwn(object, key);
}
