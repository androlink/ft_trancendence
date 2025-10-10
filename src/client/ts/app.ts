var exports = {};
import { templates } from "./templates.js"
import { goToURL, keyExist, setHTML, goBack, launchSinglePageApp } from "./utils.js";
import { setTemplateEvents, setInnerEvents } from "./events.js";

interface ServerResponse {
	template?: string,
	title?: string,
	replace?: {[key: string]: string},
	inner?: string,
	reload?: boolean
}

let mainTemplate: string | null = null;
let mainInner: string | null = null;
export async function main() {
	const app = document.getElementById("app");
	if (!app) {
		console.error("We need an element (preferably a div) with id = app");
		return;
	}

	const data = await fetchApi();
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
	if (keyExist(data, "replace")) {
		replaceElements(data.replace);
	}
}

async function fetchApi(): Promise<ServerResponse> {
	const response = await fetch(window.location.origin
				     + "/api" + window.location.pathname);
	const data: ServerResponse = await response.json();
	return data;
}

function changeTemplate(app: HTMLElement, data: ServerResponse) : void
{
	if (!keyExist(templates, data.template)) {
		app.innerHTML = "";
		app.innerText = "Template " + data.template + " not Found in template.js";
		return;
	}
	setHTML(app, templates[data.template]);
	setTemplateEvents();
}

function changeInner(inner: HTMLElement, data: ServerResponse) : void {
	setHTML(inner, templates[data.inner]);
	const parent = document.getElementById("inner-buttons");
	if (parent){
		const elements = parent.children;
		for (let i = 0; i < elements.length; i++) {
			elements[i].toggleAttribute("data-checked", (elements[i].getAttribute("name") === data.inner));
		}
	}
	setInnerEvents();
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	for (const key in toReplace) {
		let element = document.getElementById(key);
		if (element) {
			element.innerText = toReplace[key];
		}
	}
}

launchSinglePageApp();
