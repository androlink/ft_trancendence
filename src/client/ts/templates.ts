
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
	<div class="flex justify-between space-x-2 mx-8 my-2">
		<div class="flex">
			<input type="text" placeholder="login" class="text-sm rounded-lg block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white checked:ring-blue-500 checked:border-blue-500"/>
		</div>
		<div class="flex space-x-2">
			<img src="notification-icon.png" class="invert-50 size-10 cursor-pointer">
			<img src="settings-icon.png" class="invert-50 size-10 cursor-pointer">
		</div>
	</div>
	<div class="flex space-x-2 mx-8">
		<label class="cursor-pointer">
			<input type="radio" name="option" class="peer hidden">
			<div onclick="goToURL( )"		class="cursor-pointer peer-checked:cursor-default select-none rounded hover:border-transparent peer-checked:text-white peer-checked:bg-gray-500 bg-gray-700 text-gray-300">&nbsp;pdf&nbsp;</div>
  		</label>
    	<label>
			<input type="radio" name="option" class="peer hidden">
			<div onclick="goToURL('game')"	class="cursor-pointer peer-checked:cursor-default select-none rounded hover:border-transparent peer-checked:text-white peer-checked:bg-gray-500 bg-gray-700 text-gray-300">&nbsp;game&nbsp;</div>
		</label>
    	<label class="cursor-pointer">
			<input type="radio" name="option" class="peer hidden">
			<div onclick="goToURL('video')"class="cursor-pointer peer-checked:cursor-default select-none rounded hover:border-transparent peer-checked:text-white peer-checked:bg-gray-500 bg-gray-700 text-gray-300">&nbsp;video&nbsp;</div>
		</label>
	</div>
	<div id="inner" class="flex-1 mx-8 mb-8 mt-4"></div>
	`,
	"Game":
		`
	<iframe src="https://ivark.github.io/AntimatterDimensions/" class="size-full border-transparent" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
		`,
	"Video":
		`
	<iframe src="https://www.youtube.com/embed/G4Df2vAnKZo?si=Ipkn9vWNl5og77iJ" class="size-full border-transparent" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
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
