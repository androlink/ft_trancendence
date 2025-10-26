var exports = {};
import { templates } from "./templates.js"

import {setupChat} from "./chat.js"

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

type ApiResponse = {message: string };

async function get(path: string, cache: RequestCache = "default"): Promise<ApiResponse> {
    return await fetch(`https://${window.location.hostname}/${encodeURI(path)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "include",
        cache,
    }).then(function (res) {
        return res.json() as any as ApiResponse;
    });
}

async function post(path: string, body: object = {}): Promise<ApiResponse> {
    return await fetch(`https://${window.location.hostname}${encodeURI(path)}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
    }).then(function (res) {
        return res.json() as any as ApiResponse;
    });
}


window.addEventListener('popstate', function(event) {
	main();
}, false);

function setHTML(element: HTMLElement, text: string) : void {
	element.innerHTML = text;
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	for (const key in toReplace) {
		let element = document.getElementById(key);
		if (element) {
			element.innerText = toReplace[key];
		}
	}
}

function changeTemplate(app: HTMLElement, data: ServerResponse) : void
{
	if (!keyExist(templates, data.template)) {
		app.innerHTML = "";
		app.innerText = "Template " + data.template + " not Found in template.js";
		return;
	}
	setHTML(app, templates[data.template]);
	let textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
	if (textarea)
		setEnterEventChat(textarea);
	textarea = document.getElementById("username-search") as HTMLTextAreaElement;
	if (textarea)
		setEnterEventUsername(textarea);
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
				if (historyCounter > 1) {
					historyCounter--;
					history.back();
				} else {
					goToURL("profile");
				}
			} else if (keyExist(result, "reason")) {
				const child = form.lastElementChild;
				if (child) child.textContent = result.reason;
				else alert(result.reason)
			}
		} catch (error) {
			alert('An error occurred');
		}
	});
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
	const form = document.getElementById('login-form') as HTMLFormElement;
	if (form)
		setSubmitEventLogin(form);
}


function setEnterEventUsername(textarea: HTMLTextAreaElement): void {
	textarea.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Enter" && textarea.value) {
			event.preventDefault();
			goToURL("profile/" + textarea.value);
			textarea.value = "";
		}
	});
}

function setEnterEventChat(textarea: HTMLTextAreaElement): void {
}

let mainTemplate: string | null = null;
let mainInner: string | null = null;
let historyCounter = 1;
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
	if (keyExist(data, "replace"))
		replaceElements(data.replace);

	setupChat();
}

document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))});


// for moving page to page, used by html
export function goToURL(NextURL:string | void) {
	history.pushState( {page: "not used"}, "depracated", NextURL ? "/" + NextURL : "/");
	historyCounter++;
	main();
}
(window as any).goToURL = goToURL;