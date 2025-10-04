import { templates } from "./templates.js"

interface ServerResponse {
	template?: string,
	title?: string,
	replace?: {[key:string]:string},
	inner?: string
}

function keyExist(dict:object, key:PropertyKey) : boolean {
	return Object.hasOwn(dict, key);
}

async function fetchApi(): Promise<ServerResponse> {
	const response = await fetch(window.location.origin
				     + "/api" + window.location.pathname);
	const data: ServerResponse = await response.json();
	return data;
}

window.addEventListener('popstate', function(event) {
	main();
}, false);

function setHTML(element: HTMLElement, text: string) : void {
	element.innerHTML = text;
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	for (const key in toReplace) {
		setHTML(document.getElementById(key), toReplace[key]);
	}
}

function changeTemplate(app: HTMLElement, data: ServerResponse) : void
{
	if (keyExist(templates, data.template)) {
		setHTML(app, templates[data.template]);
		if (keyExist(data, "replace"))
			replaceElements(data.replace);
		const textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
		if (textarea)
			setEnterEvent(textarea);
	} else {
		app.innerHTML = "Template " +
			data.template + " not Found in template.js";
	}
}


function changeInner(inner: HTMLElement, data: ServerResponse) : void {
	setHTML(inner, templates[data.inner]);
	const parent = document.getElementById("inner-buttons");
	if (parent){
		const elements = parent.children;
		for (let i = 0; i < elements.length; i++) {
			elements[i].toggleAttribute("data-checked", (elements[i].getAttribute("name") === data.inner));
			// the 4 lines below are 'better written' because of the use of dataset.
			// But I find the line above more readable

			// if (elements[i].getAttribute("name") === data.inner)
			// 	(elements[i] as HTMLElement).dataset.checked = "true";
			// else
			// 	delete (elements[i] as HTMLElement).dataset.checked;
		}
	}
}

function setEnterEvent(textarea: HTMLTextAreaElement): void {
	textarea.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	});
}

let mainTemplate: string | null = null;
let mainInner: string | null = null;
async function main() {
	const data = await fetchApi();
	const app = document.getElementById("app");
	if (!app)
		return;
	if (keyExist(data, "title")) {
		document.title = data.title;
	}
	if (keyExist(data, "template") && data.template !== mainTemplate) {
		mainTemplate = data.template;
		mainInner = null;
		changeTemplate(app, data);
	}
	const inner = document.getElementById("inner");
	if (inner && keyExist(data, "inner") && keyExist(templates, data.inner) && data.inner != mainInner){
		mainInner = data.inner;
		changeInner(inner, data);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))});


// for moving page to page, used by html
export function goToURL(NextURL:string | void) {
	history.pushState( {page: "not used"}, "depracated", NextURL ? NextURL : "/");
	main();
}
(window as any).goToURL = goToURL;

// to add something to the chat
// NOT DEFINITIVE
// NEED TO ADD sockets
// ONLY THERE (for now) TO TEST THE APPEARANCE
export function sendMessage() {
	const chat = document.getElementById("chat-content");
	const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
	if (chat && textarea && textarea.value) {
		let scroll = false;
		if (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1) {
			scroll = true;
		}
		const para = document.createElement("p");
		const node = document.createTextNode(textarea.value);
		para.appendChild(node);
		chat.appendChild(para);
		textarea.value = "";
		if (scroll) {
			chat.scrollTop = chat.scrollHeight;
		}
	}
}
(window as any).sendMessage = sendMessage;
