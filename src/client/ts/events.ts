

import { goToURL, keyExist, setHTML,  goBack } from "./utils.js";


export function setTemplateEvents() {
        let textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
        if (textarea)
            setEnterEventChat(textarea);
        textarea = document.getElementById("username-search") as HTMLTextAreaElement;
        if (textarea)
            setEnterEventUsername(textarea);
}

export function setInnerEvents() {
	const form = document.getElementById('login-form') as HTMLFormElement;
	if (form)
		setSubmitEventLogin(form);
}

function setSubmitEventLogin(form: HTMLFormElement) {
    form.addEventListener('submit', async (event: SubmitEvent) => {
        event.preventDefault();
        const formData = new FormData(form);
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({username: formData.get('username') as string, password: formData.get('password') as string})
            });

            if (!response.ok) {
                alert(`Server responded with ${response.status}`);
                return ;
            }

            const result: {success?: boolean, reason?:string} = await response.json();

            if (!keyExist(result, "success")){
                alert('Wrong response format, not normal');
            } else if (result.success) {
                goBack();
            } else if (keyExist(result, "reason")) {
                const child = form.lastElementChild;
                if (child) child.textContent = result.reason;
                else alert(result.reason)
            }
        } catch (error) {
            alert('An error occurred');
        }
    });
};

function setEnterEventChat(textarea: HTMLTextAreaElement) {
    textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
	        const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
            if (textarea && textarea.value) {
                sendMessage(textarea.value);
                textarea.value = "";
            }
        }
    });
}

// to add something to the chat
// NOT DEFINITIVE
// NEED TO ADD sockets
// ONLY THERE (for now) TO TEST THE APPEARANCE
//
// also, return boolean if the user has "seen" the message
// for instance to make a notif system. Just an example, not definitive too
export function sendMessage(message: string) {
    if (arguments.length > 1) {
        throw new SyntaxError('expected 1 argument');
    }
    if (typeof message !== "string") {
        throw new TypeError('argument must be a string, not ' +  typeof message);
    }
    if (message.length === 0) {
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
(window as any).sendMessage = sendMessage;

// used by the username input at the top of the UI
// preferably NOT DEFINITIVE (annoying to use)
function setEnterEventUsername(textarea: HTMLTextAreaElement): void {
    textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && textarea.value) {
            event.preventDefault();
            goToURL("profile/" + textarea.value);
            textarea.value = "";
        }
    });
}
