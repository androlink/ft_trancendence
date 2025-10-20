
const assetsPath = `/resources`;
const thenMain = `.then(main)`
const catchErrorAndAlert = `.catch(err => alert('Caught: ' + err));`

// theorically should use to say "as const" at the end and not :,
// to make the string readonly, but it would make the type of htmlSnippets un-readable
// Also i know the tabs and the \n after the ` are bad, the the browser trims
/**
 * all the HTML (and CSS) of the Single-Page-Application
 */
export const htmlSnippets:  {
  readonly Home: string;
  readonly Game: string;
  readonly Profile1: string;
  readonly Profile2: string;
  readonly Pdf: string;
  readonly Login: string;
  readonly Blank: string;
  readonly Error: string;
  readonly Ouch: string;
  readonly PopUp: string;
  readonly ErrorMessageHandler: string;
} = {
  Home:
    ` 
  <div class="size-full flex flex-col bg-[url(/resources/wall.jpg)] bg-no-repeat bg-center bg-size-[100%_100%] z-0">
    <div class="relative h-fit w-full">
      <div id="account-reconnected" hidden="" class="absolute z-10 top-2 right-20 rounded border bg-green-200 border-green-400 h-full flex justify-around flex-col items-center overflow-hidden">
        <p class="m-2 font-bold">You got auto reconnected :D</p>
      </div>
      <div id="account-disconnected" hidden="" class="absolute z-10 top-2 right-8 rounded border bg-red-200 border-red-400 h-full flex justify-around flex-col items-center overflow-hidden">
        <p class="mx-2 font-bold">You are not connected</p>
        <button class="bg-white rounded size-fit p-1" onclick="goToURL('profile', true);">login page</button>
      </div>
      <img class="absolute left-1/2 top-0 -translate-x-1/2 h-full aspect-auto select-none" draggable="false" src="${assetsPath}/transcendence-sign.png"/>
      <span class="relative flex flex-row mx-8 my-2 justify-between">
        <span class="flex">
          <input id="user-search" type="search" spellcheck="false" placeholder="username" class="placeholder:italic text-sm select-none rounded-lg block p-2.5 bg-gray-800 border-gray-600 placeholder-gray-400 text-white focus:outline focus:ring-blue-500 focus:border-blue-500"/>
        </span>
        <img src="${assetsPath}/exit-icon.png" onclick="if (self.isConnected) fetch('/logout', {method: 'POST'})${thenMain}${catchErrorAndAlert}" class="select-none hover:animate-spin hover:invert-25 size-10 cursor-pointer" draggable="false">
      </span>
      <span id="inner-buttons" class="flex gap-x-2 mx-8 *:px-1 *:cursor-pointer *:data-checked:cursor-default *:select-none *:rounded *:data-checked:text-white *:data-checked:bg-gray-500 *:bg-gray-700 *:text-gray-300">
        <div onclick="goToURL( )" name="">pdf</div>
        <div onclick="goToURL('game')" name="game">game</div>    
        <div onclick="goToURL('blank')" name="blank">debug</div>
        <div onclick="goToURL('profile')" name="profile">your profile</div>
      </span>
    </div>
    <span class="flex-1 min-h-0 flex gap-2 mx-8 mb-8 mt-4 select-none">
      <div id="inner" class="h-full w-3/4 overflow-hidden">
      </div>
      <div class="h-full w-1/4 flex flex-col overflow-hidden">
        <div class="size-full bg-white flex flex-col">
          <div id="chat-content" class="overflow-y-scroll w-full h-0 grow *:px-1 *:wrap-break-word *:select-text *:whitespace-pre-line *:even:bg-gray-300 *:odd:bg-gray-100"></div>
          <span class="flex justify-items-stretch">
            <textarea id="chat-input" class="px-1 flex-1 field-sizing-fixed border-gray-700 focus:border-black border-2 focus:outline m-1 rounded resize-none"></textarea>
            <img src="${assetsPath}/send-icon.png" onclick="let d = document.getElementById('chat-input'); if (d && d.value) {sendMessage(d.value); d.value = '';}" class="self-center select-none invert-50 hover:invert-75 size-8 mr-1 cursor-pointer" draggable="false">
          </span>
        </div>
      </div>
    </span>
  <div>
  `,
  Game:
    `
  <iframe src="https://ivark.github.io/AntimatterDimensions/" class="size-full border-transparent outline" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
  `,
  Profile1:
    `
  <div class="bg-gray-800 rounded-2xl p-2 size-full flex flex-col">
    <form id="profile-form" class="relative border-4 border-gray-900 rounded-2xl p-3 w-full grow flex flex-col overflow-y-scroll overflow-x-hidden">
      <p id="go-to-profile" class="absolute -top-1 -left-1 text-white size-fit px-2 py-1 rounded bg-blue-950 underline decoration-dashed decoration-gray-400 hover:cursor-pointer">public infos</p>
      <span class="flex justify-around place-items-center">
        <input id="username" value="" class="px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
        <img class="size-40 rounded-full" src="${assetsPath}/default-avatar.jpg" draggable="false">
      </span>
      <p class="text-white -ml-2">biography:</p>
      <textarea id="biography" class="resize min-w-1/4 min-h-1/8 max-w-full max-h-full w-1/2 whitespace-pre-line px-1 text-white rounded bg-gray-500 wrap-break-word" name="biography"></textarea>
      <button class="place-self-center bg-white rounded size-fit p-1 my-1 mt-auto hover:cursor-pointer" type="submit">update</button>
    </form>
    <span class="relative border-4 border-gray-900 rounded-2xl p-3 w-full h-fit min-h-fit grid grid-flow-col overflow-hidden">
      <p class="absolute -top-1 -left-1 text-white size-fit px-2 py-1 rounded bg-amber-900">private infos</p>
      <form id="change-password-form" class="mt-5">
        <span class="flex gap-5 w-1/2">
          <div class="flex gap-2 flex-col p-1">
            <input placeholder="new password" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password">
            <input placeholder="confirm password" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
          </div>
          <button class="self-center whitespace-nowrap bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">change password</button>
        </span>
      </form>
      <form id="delete-account-form" class="mt-5 flex flex-col items-center">
          <input placeholder="confirm username" title="a missclick-security" class="px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
          <button class="bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">erase account</button>
        </span>
      </form>
    </span>
  </div>

  `,
  Profile2:
    `
  <div class="relative size-full overflow-hidden shadow-xl/100">
    <img src="${assetsPath}/window.png" class="absolute inset-0 size-full z-40 pointer-events-none" draggable="false">
    <div class="bg-[url(/resources/garden.jpg)] bg-no-repeat bg-center bg-size-[100%_100%] size-full relative">
      <div class="pointer-events-none -skew-2 bg-[url(/resources/username-sign.png)] bg-no-repeat bg-size-[100%_100%] absolute bottom-0 left-1/2 -translate-x-1/2 bg-center min-h-1/3 aspect-3/4 flex flex-col z-30">
        <div class="h-1/9"></div>
        <p tabindex="-1" class="pointer-events-auto h-35/127 rounded-2xl w-29/30 mx-auto text-center size-full font-bold select-text whitespace-nowrap" id="username"></p>
      </div>
      <div class="pointer-events-none bg-[url(/resources/stickman.png)] bg-no-repeat bg-size-[100%_100%] absolute -bottom-1/8 left-1/3 -translate-x-1/2 bg-center h-6/7 aspect-3/4 flex flex-row z-10">
        <div class="w-8/70"></div>
        <img class="pointer-events-auto rounded-full h-2/5 aspect-auto" src="${assetsPath}/pfp.jpg" draggable="false">
      </div>
      <div class="pointer-events-none rotate-5 bg-[url(/resources/username-sign.png)] bg-no-repeat bg-size-[100%_100%] absolute bottom-0 left-3/5 -translate-x-1/2 bg-center w-fit max-w-1/3 min-h-1/2 max-h-3/4 aspect-3/4 flex flex-col z-20">
        <div class="h-1/25"></div>
        <p tabindex="-1" class="pointer-events-auto text-center h-35/127 rounded-2xl select-text mx-auto overflow-y-auto w-29/30 wrap-break-word" id="biography"></p>
      </div>
    </div>
  </div>
  `,
  Pdf:
    `
  <iframe src="${assetsPath}/sample.pdf" class="size-full border-transparent" title="Embedded PDF Viewer"></iframe>
  `,
  Login:
    `
  <div class="bg-gray-800 rounded-2xl p-3 size-full flex flex-col gap-y-1">
  <span class="grid grid-cols-2 grid-rows-2 place-items-center size-full *:border-3 *:bg-gray-600 *:border-gray-500 *:p-2 *:rounded *:gap-1 *:flex *:flex-col *:relative">
    <form id="login-form">
      <label class="text-white size-fit" for="username">username:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="text" name="username">
      <label class="text-white size-fit" for="password">password:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="password" name="password">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">login</button>
    </form>
    <form id="register-form">
      <label class="text-white size-fit" for="username">username:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="text" name="username">
      <label class="text-white size-fit" for="password">password:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password">
      <label class="text-white size-fit" for="password">confirm password:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">register</button>
    </form>
    <div>
      <p class="text-white size-fit">Google auth and stuff</p>
    </div>
    <div>
      <p class="text-white size-fit">Welcome</p>
    </div>
  </span>
  </div>
  `,
  Blank:
    `
  `,
  Error:
    `
  <div class="flex flex-col items-center size-1/2 m-40 place-self-center">
    <h1 id=status class="text-black font-bold"></h1>
    <h2 id=message class="text-black"></h2>
    <img src="${assetsPath}/error.png" alt="error" class="justify-self-start select-none h-full" draggable="false">
    <button onclick="goToURL( )" type="button" class="cursor-pointer data-checked:cursor-default select-none rounded hover:text-white hover:bg-gray-500 bg-gray-700 text-gray-300 px-1">home</button>
  </div>
  `,

  Ouch:
    `
  <iframe id="container-iframe" class="size-full bg-gray-200" srcdoc="">
  </iframe>
  `,
  PopUp:
    `
  <div class="absolute top-2 -translate-x-1/2 left-1/2 w-1/2 h-fit bg-gray-300 rounded shadow-xl/50">
    <p class="text-black p-1 text-center">
      Hello. I've made some shortcuts, and found them really useful so...<br><br>
      CTRL + P => goes to your profile editor<br>
      CTRL + P at your profile editor => goes to your public profile<br>
      CTRL + E => disconnect you<br>
      CTRL + Enter => selects the Chat<br>
      CTRL + K => selects the profile... reasearch... thing... at the top left<br>
      ? => shows this menu <br><br>
      Shoutout to the default shortcuts<br>
      alt + (left || right) arrow => navigate history<br>
      tab && shift + tab => select elements<br>
      <br>
      CTRL + E with user-search selected => disconnect you without page reset, debug only, that line will be removed soon
    </p>
  </div>
    `,
  ErrorMessageHandler:
    `
  <p name="error-handler" class="text-red-500 font-bold mb-2"></p>
    `
} as const;
