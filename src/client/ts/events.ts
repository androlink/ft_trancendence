

import { goToURL, keyExist, resetDisconnectTimer } from "./utils.js";
import { htmlSnippets } from "./templates.js";
import { main } from "./app.js";

/**
 * set all the events that the page need to work properly
 */
export function setEvents(): void {
    let elem: any;
    elem = document.getElementById("chat-input") as HTMLTextAreaElement;
    if (elem && !elem.hasAttribute("data-custom"))
        setEnterEventChat(elem);
    elem = document.getElementById("username-search") as HTMLTextAreaElement;
    if (elem && !elem.hasAttribute("data-custom"))
        setEnterEventUsername(elem);
    elem = document.getElementById('login-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setSubmitEventLogin(elem);
    elem = document.getElementById('register-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setSubmitEventRegister(elem);
    elem = document.getElementById('profile-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setSubmitEventProfile(elem);
    elem = document.getElementById('go-to-profile') as HTMLElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setClickEventProfile(elem);
    elem = document.getElementById('change-password-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		    setSubmitEventPassword(elem);
}

/**
 * it will try to write the error on the last child of the element if named
 *  
 * @param form the form element
 * @param message the error that will be shown
 */
function writeErrorOrAlert(form: HTMLFormElement, message: string): void {
    const child = form.lastElementChild;
    if (child && child.getAttribute("name") === "error-handler") {
        child.textContent = message;
    } else {
        alert(message)
    }
}

/**
 * used by the login form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventLogin(form: HTMLFormElement): void {
    form.toggleAttribute("data-custom", true);
    form.addEventListener('submit', async (event: SubmitEvent) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;
            if (!username || !password) {
                writeErrorOrAlert(form, `${username ? "Password" : "Username"} field is empty`);
                return ;
            }
            const response = await fetch('/login', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: formData.get('username') as string, 
                    password: formData.get('password') as string,
                }),
            });

            if (!response.ok) {
                writeErrorOrAlert(form, `Server responded with ${response.status}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();
            if (!keyExist(result, "success")) {
                writeErrorOrAlert(form, "Wrong response format, not normal");
            } else if (result.success) {
                main();
            } else if (keyExist(result, "reason")) {
                writeErrorOrAlert(form, result.reason);
            }
        } catch (error) {
            writeErrorOrAlert(form, error as string);
        }
    });
}


/**
 * used by the Password change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventRegister(form: HTMLFormElement): void {
    form.toggleAttribute("data-custom", true);
    form.addEventListener('submit', async (event: SubmitEvent) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;
            if (!username || !password) {
                writeErrorOrAlert(form, `${username ? "Password" : "Username"} field is empty`);
                return ;
            }
            if (password !== formData.get("password-confirm") as string) {
                writeErrorOrAlert(form, "the two passwords need to correspond");
                return ;
            }
            const response = await fetch('/register', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                writeErrorOrAlert(form, `Server responded with ${response.status} ${response.statusText}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();
            if (!keyExist(result, "success")) {
                writeErrorOrAlert(form, "Wrong response format, not normal");
            } else if (result.success) {
                goToURL("/profile");
            } else if (keyExist(result, "reason")) {
                writeErrorOrAlert(form, result.reason);
            }
        } catch (error) {
            writeErrorOrAlert(form, error as string);
        }
    });
}

/**
 * used by the Profile form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventProfile(form: HTMLFormElement): void {
    form.toggleAttribute("data-custom", true);
    form.addEventListener('submit', async (event: SubmitEvent) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch('/update', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: formData.get('username') as string,
                    biography: formData.get('biography') as string,
                }),
            });

            if (!response.ok) {
                writeErrorOrAlert(form, `Server responded with ${response.status} ${response.statusText}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();

            if (!keyExist(result, "success")) {
                alert('Wrong response format, not normal');
            } else if (result.success) {
                goToURL(`profile/${formData.get('username') as string}`);
            } else if (keyExist(result, "reason")) {
                writeErrorOrAlert(form, result.reason);
            }
        } catch (error) {
            writeErrorOrAlert(form, error as string);
        }
    });
}


/**
 * used by the Passwrd change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventPassword(form: HTMLFormElement): void {
    form.toggleAttribute("data-custom", true);
    form.addEventListener('submit', async (event: SubmitEvent) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const newPassword = formData.get("password-1") as string;
            if (newPassword !== formData.get("password-2") as string) {
                writeErrorOrAlert(form, "the two passwords need to be the same");
                return ;
            }
            const response = await fetch('/password', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    password: newPassword, 
                }),
            });

            if (!response.ok) {
                writeErrorOrAlert(form, `Server responded with ${response.status} ${response.statusText}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();
            if (!keyExist(result, "success")) {
                writeErrorOrAlert(form, "Wrong response format, not normal");
            } else if (result.success) {
                const elem = document.getElementById("username");
                if (elem && elem.hasAttribute("value"))
                    goToURL(`profile/${elem.getAttribute("value")}`);
                else
                    goToURL( );
            } else if (keyExist(result, "reason")) {
                writeErrorOrAlert(form, result.reason);
            }
        } catch (error) {
            writeErrorOrAlert(form, error as string);
        }
    });
}

/**
 * used by the button that goes to the public profile from /profile
 * @param text the HTMLElement that's gonna get the event
 */
function setClickEventProfile(text: HTMLElement): void {
    text.toggleAttribute("data-custom", true);
    const elem = document.getElementById("username");
    if (!elem || !elem.hasAttribute("value"))
        return ;
    const username: string = elem.getAttribute("value");
    text.addEventListener("click", (event: PointerEvent) => 
        goToURL(`profile/${username}`)
    );
}

/**
 * used by the chat input, send message on enter
 * OBVIOUSLY not definitive
 * @param textarea the said chat input element
 */
function setEnterEventChat(textarea: HTMLTextAreaElement): void {
    textarea.toggleAttribute("data-custom", true);
    textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (textarea && textarea.value) {
                sendMessage(textarea.value);
                textarea.value = "";
            }
        }
    });
}


/**
 * to add a new message to the chat.
 *
 * NOT DEFINITIVE,
 * NEED TO ADD SOCKETS,
 * ONLY THERE (for now) TO TEST THE APPEARANCE
 *
 * @param message the message
 * @returns true if the user has "seen" the message.
 * For instance to make a notif system.
 */
export function sendMessage(message: string): boolean {
    if (arguments.length !== 1) {
        throw new SyntaxError('expected 1 argument');
    }
    if (typeof message !== "string") {
        throw new TypeError(`argument must be a string, not ${typeof message}`);
    }
    if (!message.length) {
        throw new SyntaxError(`argument must be a string WITH CHARS IN IT`);
    }

	const chat = document.getElementById("chat-content");
	if (!chat) {
        console.error(`message '${message}' not sent to the chat because the chat is not found`);
		return false;
	}

	let scroll = (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1);
	// true if at the end of the chat
	const para = document.createElement('p');
	const node = document.createTextNode(message);
	para.appendChild(node);
	chat.appendChild(para);
	if (scroll) {
		chat.scrollTop = chat.scrollHeight;
	}
    return scroll;
}
window["sendMessage"] = sendMessage;

/**
 * Used by the username input at the top of the UI.
 * Preferably NOT DEFINITIVE (annoying to use)
 * @param textarea the said username input
 */
function setEnterEventUsername(textarea: HTMLTextAreaElement): void {
    textarea.toggleAttribute("data-custom", true);
    textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === 'Enter' && textarea.value) {
            event.preventDefault();
            goToURL(`profile/${textarea.value}`);
            textarea.value = "";
        }
    });
}

/**
 * Used at the start of the app-launching, to keyboard shortcut
 * - control K will select (if present) the username-search
 * - control enter will select (if present) the chat-input
 * - control P will search for /profile or /profile/username instead of printing the page
 */
export function setCtrlfEventUsername(): void {
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            const elem = document.getElementById("username-search") as HTMLTextAreaElement;
            if (elem) {
                e.preventDefault();
                elem.select();
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const elem = document.getElementById("chat-input") as HTMLTextAreaElement;
            if (elem) { // might have to add if not hidden later
                e.preventDefault();
                elem.select();
            }
        }

        if ((e.ctrlKey || e.metaKey) && ! e.shiftKey && e.key === 'p') {
            e.preventDefault();
            const elem = document.getElementById("username");
            if (elem && elem.hasAttribute("value")) {
                goToURL(`profile/${elem.getAttribute("value")}`);
                return ;
            }
            goToURL('profile');
        }

        if ((e.ctrlKey || e.metaKey) && ! e.shiftKey && e.key === 'e') {
            if (window["isConnected"]) {
                e.preventDefault();
                fetch("/logout", {method: 'POST'}).then(
                    res => {
                        resetDisconnectTimer(res.headers.get("x-authenticated")); 
                        main();
                    }
                ).catch(err => alert('Caught: ' + err));
            }
        }
    })

    const app = document.getElementById("app");
    const help = document.createElement('div');
    help.setHTMLUnsafe(htmlSnippets["PopUp"]);
    let isPressed = false;
    try {
        if (app) {
            window.addEventListener("keypress", (e) => {
                if (e.key === '?' && !isPressed) {
                    isPressed = true;
                    console.log(htmlSnippets["PopUp"]);
                    app.appendChild(help);
                    console.log(help.className)
                }
            });
            window.addEventListener("keyup", (e) => {
                if (isPressed) {
                    isPressed = false;
                    if (app.contains(help))
                        app.removeChild(help);
                }
            });
        }
    } catch (e) {
        console.error(e)
    }
}
