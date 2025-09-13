
export const templates = {
	"Login":
		`
	<label for="fname">login:</label>
		<input type="text" id="fname" name="fname"><br><br>
	<label for="lname">password:</label>
		<input type="password" id="lname" name="lname"><br><br>
	<div id="demo">
	<button onclick="document.getElementById('demo').innerHTML = '<p>Tu pensais vraiment qu il y avait de quoi se login ?</p><button onclick=&quot;goToURL\`home\`()&quot; type=&quot;button&quot;>Home Page</button>'">login/register</button>
	</div>
	`,
	"Home":
		`
	<p class="text-white italic h-1/25">Make yourself cosy</p>
	<button onclick="goToURL( )" class="rounded hover:border-transparent active:text-white active:bg-gray-500 bg-gray-700 text-gray-300 h-1/25 m-2">&nbsp;pdf&nbsp;</button>
	<button onclick="goToURL('game')" class="rounded hover:border-transparent active:text-white active:bg-gray-500 bg-gray-700 text-gray-300 m-2">&nbsp;game&nbsp;</button>
	<button onclick="goToURL('video')" class="rounded hover:border-transparent active:text-white active:bg-gray-500 bg-gray-700 text-gray-300 m-2">&nbsp;trailer&nbsp;</button>
	<div id="inner" class="m-auto w-90/100 h-85/100"></div>
	`,
	"Game":
		`
	<iframe src="https://ivark.github.io/AntimatterDimensions/" class="size-full" frameborder="0" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
		`,
	"Video":
		`
	<iframe class="size-full" src="https://www.youtube.com/embed/G4Df2vAnKZo?si=Ipkn9vWNl5og77iJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
		`,
	"Pdf":
		`
	<iframe src="sample.pdf" class="size-full border-transparent" title="Embedded PDF Viewer"></iframe>
	`,
	"Error":
		`
	<h1 id=status></h1>
	<h2 id=message></h2>
	<img src="error.png" alt="error" width="250" height="300">
	<button onclick="goToURL( )" type="button">home</button>
	`
}
