import { templates } from "./templates.js"

interface ServerResponse {
	template?: string,
	title?: string,
	replace?: {[key:string]:string}
}

function keyExist(dict:object, key:PropertyKey) : boolean {
	return Object.hasOwn(dict, key)
}

export function goToURL(NextURL:string) {
	history.pushState( {page: "not used"}, "depracated", NextURL ? NextURL:"/");
	main();
}

(window as any).goToURL = goToURL;

async function fetchApi(): Promise<ServerResponse> {
	const response = await fetch(window.location.origin
				     + "/api" + window.location.pathname);
	const data: ServerResponse = await response.json();
	return data
}

window.addEventListener('popstate', function(event) {
	main()
}, false);

function setElement(text: string, element: HTMLElement) : void {
	element.innerHTML = text
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	for (const key in toReplace) {
		setElement(toReplace[key], document.getElementById(key))
	}
}

async function main() {
	const data = await fetchApi()
	const app: HTMLElement | null = document.getElementById("app")
	if (app === null)
		return
	app.innerHTML = "fetch didn't get template element. Not normal"
	if (keyExist(data, "title")) {
		document.title = data.title;
	}
	if (keyExist(data, "template")) {
		if (keyExist(templates, data.template)) {
			setElement(templates[data.template], app)
			if (keyExist(data, "replace"))
				replaceElements(data.replace)
		} else {
			app.innerHTML = "Template " +
				data.template + " not Found in template.js"
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))})
