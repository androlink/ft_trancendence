var exports = {};
import { templates } from "./templates.js"
import { goToURL, keyExist, setHTML, launchSinglePageApp, resetDisconnectTimer } from "./utils.js";
import { setTemplateEvents, setInnerEvents } from "./events.js";

interface ServerResponse {
	template?: string,
	title?: string,
	replace?: {[key: string]: string},
	inner?: string,
	reload?: boolean
}

export async function main() {
	const app = document.getElementById("app");
	if (!app) {
		console.error("We need an element (preferably a div) with id=\"app\"");
		return;
	}

	const data = await fetchApi();
	if (!data) {
		return;
	}
	if (keyExist(data, "title")) {
		document.title = data.title;
	}
	if (keyExist(data, "template")) {
		changeTemplate(app, data);
	}
	const inner = document.getElementById("inner");
	if (inner && keyExist(data, "inner")) {
		changeInner(inner, data);
	}
	if (keyExist(data, "replace")) {
		replaceElements(data.replace);
	}
}
(window as any).main = main;

async function fetchApi() {
	let response: Response | null = null;
	try {
		response = await fetch(`${window.location.origin}/api${window.location.pathname}`, {credentials: 'include'});
		resetDisconnectTimer(response.headers.get('x-authenticated'));
		if (response.status >= 500 && response.status < 600 ||
			!(response.headers.has("content-type")) || !response.headers.get("content-type").startsWith("application/json")) {
			return {template: "Home", replace: {"container-iframe": await response.text()}, title: `${response.status} ${response.statusText}`, inner: "Ouch"};
		}
		return await response.json() as ServerResponse;
	} catch (error) {
		alert(error instanceof Error ? error.message : String(error));
		return null;
	}
}

function changeTemplate(app: HTMLElement, data: ServerResponse) {
	if (!keyExist(templates, data.template)) {
		app.innerHTML = "";
		app.innerText = `Template ${data.template} not Found in template.js`;
		return;
	}
	setHTML(app, templates[data.template]);
	setTemplateEvents();
}

function changeInner(inner: HTMLElement, data: ServerResponse) {
	if (!keyExist(templates, data.inner)) {
		inner.innerHTML = "";
		inner.innerText = `Template ${data.inner} not Found in template.js`;
		return;
	}
	setHTML(inner, templates[data.inner]);
	const parent = document.getElementById("inner-buttons");
	if (parent){
		const elements = parent.children;
		for (let i = 0; i < elements.length; i++) {
			elements[i].toggleAttribute("data-checked",
				('/' + elements[i].getAttribute("name") === document.location.pathname));
		}
	}
	setInnerEvents();
}

function replaceElements(toReplace: {[key:string]:string}) {
	for (const key in toReplace) {
		let element = document.getElementById(key);
		if (element) {
			if (element.hasAttribute("value")) { // for <input>
				element.setAttribute("value", toReplace[key]);
			} else if (element.hasAttribute("srcdoc")) { // for <iframe>
				element.setAttribute("srcdoc", toReplace[key]);
			} else {
				element.innerText = toReplace[key];
			}
		}
	}
}

launchSinglePageApp();
