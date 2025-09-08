import { templates } from "./templates.js"

interface ServerResponse {
	template?: string,
	title?: string,
	replace?: {[key:string]:string}
}

function keyExist(dict:object, key:PropertyKey) : boolean {
	return Object.hasOwn(dict, key)
}

async function fetchApi(): Promise<ServerResponse> {
	const response = await fetch(window.location.origin
				     + "/api" + window.location.pathname);
	const data: ServerResponse = await response.json();
	return data
}

window.addEventListener('popstate', function(event) {
	main()
}, false);

function setHTML(element: HTMLElement, text: string) : void {
	element.innerHTML = text
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	for (const key in toReplace) {
		setHTML(document.getElementById(key), toReplace[key])
	}
}

async function main() {
	const data: ServerResponse = await fetchApi()
	const app: HTMLElement | null = document.getElementById("app")
	if (app === null)
		return
	if (keyExist(data, "title")) {
		document.title = data.title;
	}
	if (keyExist(data, "template") && data.template != main.template) {
		main.template = data.template
		if (keyExist(templates, data.template)) {
			setHTML(app, templates[data.template])
			if (keyExist(data, "replace"))
				replaceElements(data.replace)
		} else {
			app.innerHTML = "Template " +
				data.template + " not Found in template.js"
		}
	}
	const inner: HTMLElement | null = document.getElementById("inner");
	if (inner && keyExist(data, "inner") && keyExist(templates, data.inner) && data.inner != main.inner){
		main.inner = data.inner
		setHTML(inner, templates[data.inner])
	}
}

document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))})


// for moving page to page, used by html
export function goToURL(NextURL:string | void) {
	history.pushState( {page: "not used"}, "depracated", NextURL ? NextURL:"/");
	main();
}
(window as any).goToURL = goToURL;
