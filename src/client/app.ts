async function fetchApi() {
	const response = await fetch(window.location.origin + "/api" + window.location.pathname);
	const data = await response.json();
	return data
}

async function main() {
	const data = await fetchApi()


	const app = document.getElementById("app")
	if (!app)
		return
	app.innerHTML = ""

	if (data.hasOwnProperty("content")) {
		const text = document.createElement("p")
		text.textContent = data.content
		app.appendChild(text)
	}
	if (data.hasOwnProperty("button_fetch")) {
		const button = document.createElement("button")
		button.textContent = data.button_fetch.name
		button.addEventListener("click", () => {
			const state = { page: "about" };
			const title = data.button_fetch.title;
			const url = data.button_fetch.url;
			history.pushState(state, title, url);
			main();
		})
		app.appendChild(button)
	}
}

// Start app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	main().catch(err => console.error(err))})
