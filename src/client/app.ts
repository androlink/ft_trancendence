import { templates } from "./templates.js"

interface ServerResponse {
	template?:string,
	title?:string,
	replace?: {[key:string]:string}
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

function setElement(text: string, element: HTMLElement) : void {
	element.innerHTML = text
}

function replaceElements(toReplace: {[key:string]:string}) : void {
	console.log(toReplace)
	for (const key in toReplace) {
		console.log(key)
		setElement(toReplace[key], document.getElementById(key))
	}
}

async function main() {
	const data = await fetchApi()
	const app: HTMLElement | null = document.getElementById("app")
	if (!app)
		return
	app.innerHTML = ""

	if ("title" in data) {
		document.title = data.title;
	}
	if ("template" in data) {
		if (templates.hasOwnProperty(data.template)) {
			setElement(templates[data.template], app)
			if ("replace" in data)
				replaceElements(data.replace)
		} else {
			app.innerHTML = "Template not Found"
		}
	}
}

// Start app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))})
