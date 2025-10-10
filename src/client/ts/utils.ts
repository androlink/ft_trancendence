
import { main } from "./app.js"

//----------------------------------------------------------------------------#
//                               HISTORY STUFF                                #
//----------------------------------------------------------------------------#

// to keep knowing how deep we went into the history
let historyCounter = 1;

// for moving page to page, used (not only) by html
export function goToURL(NextURL:string | void) {
    if (arguments.length > 1) {
        throw new SyntaxError('expected 0 to 1 argument');
    }
    if (!["undefined", "string"].includes(typeof NextURL)) {
        throw new TypeError('argument must be a string, not ' +  typeof NextURL);
    }

	NextURL = NextURL ? "/" + NextURL : "/";
	if (location.pathname === NextURL)
		return ;
	historyCounter++;
	history.pushState( {page: "not used"}, "depracated", NextURL);
	main();
}
(window as any).goToURL = goToURL;

// for moving back, used by /login button event
export function goBack() {
    if (historyCounter > 1) {
        historyCounter--;
        history.back();
        return ;
    }
    goToURL("profile");
}

// reload the page when user touch history arrow buttons
function setArrowButton() {
    window.addEventListener('popstate', () => main(), false);
};

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