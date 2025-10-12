
const assetsPath = '/ressources';

export const templates = {
	"Home":
		`
	<span class="grid grid-cols-3 mx-8 my-2">
		<span class="flex justify-self-start">
			<input id="username-search" type="text" placeholder="username" class="text-sm select-none rounded-lg block p-2.5 bg-gray-800 border-gray-600 placeholder-gray-400 text-white focus:outline focus:ring-blue-500 focus:border-blue-500"/>
		</span>
		<p class="justify-self-center self-center text-3xl font-mono text-blue-900 font-semibold select-none">ft_transcendence</p>
		<span class="justify-self-end flex gap-x-2">
			<span class="relative size-x-10">
				<img src="${assetsPath}/notification-icon.png" class="select-none invert-50 hover:invert-75 size-10 cursor-pointer" draggable="false">
				<span class="absolute top-0 right-0 inline-flex size-2 animate-ping rounded-full bg-sky-400 opacity-75"></span>
			</span>
			<img src="${assetsPath}/exit-icon.png" onclick="fetch('/logout', {method: 'POST'}).then(res => {resetDisconnectTimer(res.headers.get('x-authenticated')); main()})" class="invert-50 select-none hover:animate-spin hover:invert-75 size-10 cursor-pointer" draggable="false">
		</span>
	</span>
	<span id="inner-buttons" class="flex gap-x-2 mx-8 *:px-1 *:cursor-pointer *:data-checked:cursor-default *:select-none *:rounded *:data-checked:text-white *:data-checked:bg-gray-500 *:bg-gray-700 *:text-gray-300">
    	<div onclick="goToURL( )" name="">pdf</div>
    	<div onclick="goToURL('game')" name="game">game</div>		
    	<div onclick="goToURL('blank')" name="blank">debug</div>
    	<div onclick="goToURL('profile')" name="profile">your profile</div>
	</span>
	<span class="flex-1 min-h-0 flex gap-x-2 mx-8 mb-8 mt-4 select-none">
		<div id="inner" class="h-full w-3/4"></div>
		<div class="h-full w-1/4 flex flex-col">
			<div id="timer-disconnect" hidden="false" class="mb-2 rounded border bg-red-200 border-red-400 w-full h-1/2 flex justify-around flex-col items-center">
				<p class="m-2 font-bold">You're gonna be disconnected in less than a minute</p>
				<button class="bg-white rounded size-fit p-1" onclick="fetch('/api').then(res => resetDisconnectTimer(res.headers.get('x-authenticated')))">reconnect</button>
			</div>
			<div class="size-full bg-white flex flex-col">
				<div id="chat-content" class="overflow-scroll w-full h-0 grow *:px-1 *:wrap-break-word *:select-text *:whitespace-pre-line *:even:bg-gray-300 *:odd:bg-gray-100"></div>
				<span class="flex justify-items-stretch">
					<textarea id="chat-input" class="px-1 flex-1 field-sizing-fixed border-gray-700 focus:border-black border-2 focus:outline m-1 rounded resize-none"></textarea>
					<img src="${assetsPath}/send-icon.png" onclick="sendMessage( )" class="self-center select-none invert-50 hover:invert-75 size-8 mr-1 cursor-pointer" draggable="false">
				</span>
			</div>
		</div>
	</span>
	`,
	"Game":
		`
	<iframe src="https://ivark.github.io/AntimatterDimensions/" class="size-full border-transparent outline" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
	`,
	"Profile1":
		`
	<form id="profile-form"class="bg-gray-800 rounded-2xl p-3 size-full flex flex-col">
		<span class="flex justify-around place-items-center">
			<input id="username" value="" class="px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username"><br><br>
			<img class="size-40 rounded-full" src="https://st.depositphotos.com/1779253/5140/v/950/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg" draggable="false">
		</span>
		<p class="text-white">biography:</p>
		<input id="biography" value="" class="px-1 text-white rounded bg-gray-500 wrap-break-word h-0 grow overflow-y-auto" name="biography"><br><br>
		<button class="bg-white rounded size-fit p-1" type="submit">update</button>
		<p name="error-handler" class="text-red-500 font-bold"></p>
	</form>

	`,
	"Profile2":
		`
	<div class="bg-gray-800 rounded-2xl p-3 size-full flex flex-col">
		<span class="flex justify-around place-items-center">
			<h1 class="text-white" id="username"></h1>
			<img class="size-40 rounded-full" src="https://st.depositphotos.com/1779253/5140/v/950/depositphotos_51405259-stock-illustration-male-avatar-profile-picture-use.jpg" draggable="false">
		</span>
		<p class="text-white">biography:</p>
		<p class="text-white wrap-break-word h-0 grow overflow-y-auto" id="biography"></p>
	</div>
	`,
	"Pdf":
		`
	<iframe src="${assetsPath}/sample.pdf" class="size-full border-transparent" title="Embedded PDF Viewer"></iframe>
	`,
	"Login":
		`
	<div class="bg-gray-800 rounded-2xl p-3 size-full flex flex-col gap-y-1">
		<form id="login-form">
			<label class="text-white rounded size-fit" for="username">username:</label>
			<input class="text-white rounded bg-gray-500 size-fit" type="text" name="username"><br><br>
			<label class="text-white rounded size-fit" for="password">password:</label>
			<input class="text-white rounded bg-gray-500 size-fit" type="password" name="password"><br><br>
			<button class="bg-white rounded size-fit p-1" type="submit">login</button>
			<p name="error-handler" class="text-red-500 font-bold"></p>
		</form>
	</div>
	`,
	"Blank":
		`
	`,
	"Error":
		`
	<div class="flex flex-col items-center size-1/2 m-40 place-self-center">
		<h1 id=status class="text-white font-bold"></h1>
		<h2 id=message class="text-white"></h2>
		<img src="${assetsPath}/error.png" alt="error" class="justify-self-start select-none h-full" draggable="false">
		<button onclick="goToURL( )" type="button" class="cursor-pointer data-checked:cursor-default select-none rounded hover:text-white hover:bg-gray-500 bg-gray-700 text-gray-300 px-1">home</button>
	</div>
	`,

	"Ouch":
		`
	<iframe id="container-iframe" class="size-full bg-gray-200" srcdoc="">
	</iframe>
	`
}
