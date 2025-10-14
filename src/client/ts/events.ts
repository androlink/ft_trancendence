

import { goToURL, keyExist } from "./utils.js";
import { main } from "./app.js";

/**
 * set all the events that the page need to work properly
 */
export function setEvents(): void {
    let elem: HTMLTextAreaElement | HTMLFormElement;
    elem = document.getElementById("chat-input") as HTMLTextAreaElement;
    if (elem && !elem.hasAttribute("data-custom"))
        setEnterEventChat(elem);
    elem = document.getElementById("username-search") as HTMLTextAreaElement;
    if (elem && !elem.hasAttribute("data-custom"))
        setEnterEventUsername(elem);
    elem = document.getElementById('login-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setSubmitEventLogin(elem);
    elem = document.getElementById('profile-form') as HTMLFormElement;
	if (elem && !elem.hasAttribute('data-custom'))
		setSubmitEventProfile(elem);

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
            const response = await fetch('/login', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: formData.get('username') as string, 
                    password: formData.get('password') as string,
                }),
            });

            if (!response.ok) {
                alert(`Server responded with ${response.status}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();

            if (!keyExist(result, "success")) {
                alert('Wrong response format, not normal');
            } else if (result.success) {
                main();
            } else if (keyExist(result, "reason")) {
                const child = form.lastElementChild;
                if (child && child.getAttribute("name") === "error-handler") {
                    child.textContent = result.reason;
                } else {
                    alert(result.reason)
                }
            }
        } catch (error) {
            alert('An error occurred');
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
            const response = await fetch('/profile', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    username: formData.get('username') as string,
                    biography: formData.get('biography') as string,
                }),
            });

            if (!response.ok) {
                alert(`Server responded with ${response.status} ${response.statusText}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();

            if (!keyExist(result, "success")) {
                alert('Wrong response format, not normal');
            } else if (result.success) {
                goToURL(`profile/${formData.get('username') as string}`);
            } else if (keyExist(result, "reason")) {
                const child = form.lastElementChild;
                if (child && child.getAttribute("name") === "error-handler") {
                    child.textContent = result.reason;
                } else {
                    alert(result.reason)
                }
            }
        } catch (error) {
            alert('An error occurred');
        }
    });
}

/**
 * used by the chat input, send message on enter
 * @param textarea the said chat input element
 */
function setEnterEventChat(textarea: HTMLTextAreaElement): void {
    textarea.toggleAttribute("data-custom", true);
    textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
	        //const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
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
        throw new TypeError('argument must be a string, not ' +  typeof message);
    }
    if (!message.length) {
        throw new SyntaxError('argument must be a string WITH CHARS IN IT');
    }

	const chat = document.getElementById("chat-content");
	if (!chat) {
        console.error("message '" + message + "' not sent to chat because chat not found");
		return false;
	}

	let scroll = (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1);
	// true if at the end of the chat

	const para = document.createElement("p");
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
        if (event.key === "Enter" && textarea.value) {
            event.preventDefault();
            goToURL("profile/" + textarea.value);
            textarea.value = "";
        }
    });
}
/**
 * Used at the start of the app-launching, to keyboard shortcut
 * - control K will select (if present) the username-search
 * - control enter will select (if present) the chat-input
 * - control P will search for /profile instead of printing the page
 */
export function setCtrlfEventUsername(): void {
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
            const elem = document.getElementById("username-search") as HTMLTextAreaElement;
            if (elem) {
                e.preventDefault();
                elem.select();
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') {
            const elem = document.getElementById("chat-input") as HTMLTextAreaElement;
            if (elem) { // might have to add if not hidden later
                e.preventDefault();
                elem.select();
            }
        }

        if ((e.ctrlKey || e.metaKey) && ! e.shiftKey && e.code === 'KeyP') {
            goToURL('profile');
            e.preventDefault();
        }
    });
}
