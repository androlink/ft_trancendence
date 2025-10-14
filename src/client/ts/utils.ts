
import { main } from "./app.js"

//----------------------------------------------------------------------------#
//                               HISTORY STUFF                                #
//----------------------------------------------------------------------------#

/**
 * for moving page to page, used (not only) by html
 * @param NextURL the page we wanna go to
 */
export function goToURL(NextURL:string | void): void {
    if (arguments.length > 1) {
        throw new SyntaxError('expected 0 to 1 argument');
    }
    if (!["undefined", "string"].includes(typeof NextURL)) {
        throw new TypeError(`argument must be a string, not ${typeof NextURL}`);
    }

	NextURL = NextURL ? "/" + NextURL : "/";
	if (location.pathname === NextURL)
		return ;
	history.pushState({page: ""}, "", NextURL);
	main();
}
window["goToURL"] = goToURL;

/** 
 * reload the page when user touch history arrow buttons
 */
function setArrowButton() {
    window.addEventListener('popstate', main);
};

//----------------------------------------------------------------------------#
//                               TIMER STUFF                                  #
//----------------------------------------------------------------------------#

let disconnectTimer1: number;
let disconnectTimer2: number;

/**
 * sets a timer to tell you when you're gonna be disconnected soon
 * @param auth the header X-authenticated after a fresh request
 * @returns true if the timer got 14 more minutes
 */
export function resetDisconnectTimer(auth: string | null): boolean {
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
	clearTimeout(disconnectTimer1);
	clearTimeout(disconnectTimer2);
    setVisibility("timer-disconnect", false);
    if (auth !== 'true') {
        setVisibility("account-disconnected", true);
        return false;
    }
    setVisibility("account-disconnected", false);
	disconnectTimer1 = setTimeout(
		() => setVisibility("timer-disconnect", true),
        14 * 60 * 1000
	);
	disconnectTimer2 = setTimeout(
		() => {
            setVisibility("timer-disconnect", false);
            setVisibility("account-disconnected", true);
        },
        15 * 60 * 1000
	);
    return true;
}
window["resetDisconnectTimer"] = resetDisconnectTimer;

//----------------------------------------------------------------------------#
//                              PURELY COMFORT                                #
//----------------------------------------------------------------------------#

/**
 * launch the SPA at the end of loading
 * and set history control
 */
export function launchSinglePageApp() {
    document.addEventListener("DOMContentLoaded", () => {
        setArrowButton();
	    main().catch(err => console.error(err));
    });
    console.log("Hello dear user.\n" +
        "Just so you know, this website rely heavily on javascript running in the front, " +
        "messing with it might cause a lot of 4XX errors and weird display inconsistencies " +
        "(example: a popup saying you are disconnected even tho you are not)\n" +
        "This been said, have fun breaking the website");
}


/**
 * Check if object has the key to prevent crash,
 * easier to use than native js
 * @param object
 * @param key 
 * @returns Object.hasOwn(object, key);
 */
export function keyExist(object: object, key: PropertyKey) {
	return Object.hasOwn(object, key);
}

/**
 * Replace the HTML of the element, bit more readable than native js.
 * Might not be definitive
 * @param element The element whose innerHTML gonna be filled
 * @param text an html snipplet 
 */
export function setHTML(element: HTMLElement, text: string) {
	element.innerHTML = text;
}