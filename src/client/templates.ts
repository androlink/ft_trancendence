export const templates = {
	"Welcome":
		`
	<h1>Finally some cool looking spa stuff</h1>
	<button onclick="goToURL('login')" type="button">login</button>

	`,
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
	<p>Make yourself cosy</p>
	<button onclick="goToURL()" type="button">leave</button>
	<button onclick="goToURL('game')" type="game">game</button>
	`,
	"Game":
		`
	<iframe src="https://ivark.github.io/AntimatterDimensions/" style="position:fixed; top:0; left:0; width:100%; height:100%; border:none;" frameborder="0" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
	`,
	"Error":
		`
	<h1 id=status></h1>
	<h2 id=message></h2>
	<img src="error.png" alt="error" width="250" height="300">
	<button onclick="goToURL('home')" type="button">home</button>
	`
}
