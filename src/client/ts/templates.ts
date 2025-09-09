
// Can't really project due to not having a "graphic identity
// but i think we should only have "Login", "Home", "Error", "Profile" and maybe "Welcome"
// Game is there for now because it's a new page
// however when we'll have a true game I think it would look better as an integreation instead of a whole new page
// meaning it would necessite a redesign on how the code is done



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
	<p class="shadow-xl rounded-md">Make yourself cosy</p>
	<button onclick="goToURL( )" type="button">pdf</button>
	<button onclick="goToURL('game')" type="button">game</button>
	<button onclick="goToURL('video')" type="button">trailer</button>
	<div id="inner" style="width: 75vw; height: 75dvh;"></div>
	`,
	"Game":
		`
	<iframe src="https://ivark.github.io/AntimatterDimensions/" style="height: 100%; width:100%" frameborder="0" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
		`,
	"Video":
		`
	<iframe width="560" height="315" src="https://www.youtube.com/embed/G4Df2vAnKZo?si=Ipkn9vWNl5og77iJ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
		`,
	"Pdf":
		`
	<iframe
	src="en.subject.pdf"
	width="100%"
	height="100%"
	style="border:none"
	title="Embedded PDF Viewer"
	></iframe>
	`,
	"Error":
		`
	<h1 id=status></h1>
	<h2 id=message></h2>
	<img src="error.png" alt="error" width="250" height="300">
	<button onclick="goToURL( )" type="button">home</button>
	`
}
