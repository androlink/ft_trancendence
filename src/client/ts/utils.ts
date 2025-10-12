
import { main } from "./app.js"

//----------------------------------------------------------------------------#
//                               HISTORY STUFF                                #
//----------------------------------------------------------------------------#

// for moving page to page, used (not only) by html
export function goToURL(NextURL:string | void) {
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
(window as any).goToURL = goToURL;


// reload the page when user touch history arrow buttons
function setArrowButton() {
    window.addEventListener('popstate', main);
};

//----------------------------------------------------------------------------#
//                               TIMER STUFF                                  #
//----------------------------------------------------------------------------#

let disconnectTimer: number;

// it's to make a pop up to the right that tells you you're gonna be disconnected
export function resetDisconnectTimer(auth: string | null) {
    if (arguments.length !== 1) {
        throw new SyntaxError('expected 1 argument');
    }
    if (typeof auth !== 'string' && auth !== null) {
        throw new TypeError(`argument must be a string or null, not ${typeof auth}`);
    }

    if (auth === null) {
        return;
    }
	clearTimeout(disconnectTimer);
    const elem = document.getElementById("timer-disconnect");
    if (elem) {
        elem.toggleAttribute("hidden", true);
    }
    if (auth !== 'true'){
        return ;
    }
	disconnectTimer = setTimeout(
		() => {
            const elem = document.getElementById("timer-disconnect");
            if (elem) {
                elem.toggleAttribute("hidden", false);
            }
		},
        14 * 60 * 1000
	);
}
(window as any).resetDisconnectTimer = resetDisconnectTimer;

//----------------------------------------------------------------------------#
//                              PURELY COMFORT                                #
//----------------------------------------------------------------------------#

// loading the page
export function launchSinglePageApp() {
    document.addEventListener("DOMContentLoaded", () => {
	    main().catch(err => console.error(err))});
    setArrowButton();
}

// check if the json has a key, prevent crash
export function keyExist(dict: object, key: PropertyKey) {
	return Object.hasOwn(dict, key);
}

// replace the HTML of the element, bit more readable
export function setHTML(element: HTMLElement, text: string) {
	element.innerHTML = text;
}