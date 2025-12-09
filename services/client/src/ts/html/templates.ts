
export const assetsPath = `/resources`;

/**
 * all the HTML (and CSS) of the Single-Page-Application (not translated yet)
 */
const htmlSnippetsTemplate:  {
  readonly Home: string;
  readonly Game: string;
  readonly Pong: string;
  readonly Profile1: string;
  readonly Profile2: string;
  readonly Friend: string;
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
  <span class="grid grid-cols-3 mx-8 my-2">
    <div class="relative justify-self-start">
      <input id="user-search" type="search" spellcheck="false" placeholder="[[username]]" class="placeholder:italic text-sm select-none rounded-lg block p-2.5 bg-gray-800 border-gray-600 placeholder-gray-400 text-white focus:outline focus:ring-blue-500 focus:border-blue-500"/>
      <div class="absolute overflow-y-scroll z-40 max-h-5/1 w-full flex flex-col">
      </div>
    </div>
    <p class=" text-3xl font-mono text-white font-semibold select-none">ft_transcendence</p>
    <span class="justify-self-end flex gap-x-2">
      <select id="language-selector" title="[[will cause a reload]]" class="bg-gray-100 h-2/3 rounded px-1 cursor-pointer">
        <option value="en">English 🇬🇧</option>
        <option value="fr">Francais 🇫🇷</option>
        <option value="es">Español 🇪🇸</option>
      </select>
      <img src="${assetsPath}/exit-icon.png" onclick="accountLogOut()" class="invert-50 select-none hover:animate-spin hover:invert-75 size-10 cursor-pointer" draggable="false">
    </span>
  </span>
  <div class="transform-none">
    <div class="w-full h-px my-2 bg-gray-100 transform-[translateZ(0)]"></div>
  </div>
  <span id="inner-buttons" class="flex gap-x-2 mx-8 *:px-1 *:cursor-pointer *:data-checked:cursor-default *:select-none *:rounded *:data-checked:text-white *:data-checked:bg-gray-500 *:bg-gray-700 *:text-gray-300">
    <div onclick="goToURL( )" name="">pdf</div>
    <div onclick="goToURL('game')" name="game">[[game]]</div>    
    <div onclick="goToURL('blank')" name="blank">debug</div>
    <div onclick="goToURL('pong')" name="pong">[[pong]]</div>
    <div onclick="goToURL('profile')" name="profile">[[your profile]]</div>
    <div onclick="goToURL('friends')" name="friends">[[your friends]]</div>
  </span>
  <span class=" flex-1 min-h-0 grid grid-cols-4 h-full gap-x-2 mx-8 mb-8 mt-4 select-none drop-shadow-xl/50">
    <div id="inner" class="h-full col-span-3 overflow-hidden"></div>
    <div class="h-full flex flex-col overflow-hidden">
      <div id="account-reconnected" hidden="" class="mb-2 rounded border bg-green-100 border-green-400 w-full h-fit flex justify-around flex-col items-center overflow-scroll">
        <p class="m-2 font-bold">[[auto reconnected]]</p>
      </div>
      <div id="account-disconnected" hidden="" class="mb-2 rounded border bg-red-200 border-red-400 w-full h-1/2 flex justify-around flex-col items-center overflow-scroll">
        <p class="m-2 font-bold">[[not connected]]</p>
        <button class="bg-white rounded size-fit p-1 cursor-pointer border border-red-400" onclick="goToURL('profile');">[[login page]]</button>
      </div>
      <div class="rounded-md size-full bg-[#E9E9E9] flex flex-col">
        <div id="chat-content" class="overflow-y-scroll w-full h-0 grow *:px-1 *:wrap-break-word *:select-text *:whitespace-pre-line *:even:bg-gray-300 *:odd:bg-gray-100"></div>
        <div class="mx-4 mb-4 flex bg-white rounded ">
          <textarea id="chat-input" class="w-full justify-items-stretch my-0.5 resize-none" maxlength="280"></textarea>
          <img
            src="${assetsPath}/send-icon.png"
            onclick="let d = document.getElementById('chat-input'); if (d && d.value) {sendChatMessage(d.value);}"
            class="mx-2 justify-items-end self-center select-none invert-50 hover:invert-0 size-10 cursor-pointer"
            draggable="false"
          ></img>
        </div>
      </div>
    </div>
  </span>
  `,
  Game:
    ` 
  <iframe src="https://ivark.github.io/AntimatterDimensions/" class="size-full border-transparent outline" id="game" allowfullscreen="yes" allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad" sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin allow-forms" class="svelte-1qgtsbq game-filtered"></iframe>
  `,
  Profile1:
    `
  <div class="bg-gray-800 rounded-2xl p-2 size-full flex flex-col">
    <div class="relative border-4 border-gray-900 rounded-2xl w-full grow overflow-hidden">
      <p id="go-to-profile" class="absolute -top-1 -left-1 text-white size-fit px-2 py-1 rounded bg-blue-950 underline decoration-dashed decoration-gray-400 hover:cursor-pointer">[[public infos]]</p>
      <form id="pfp-form" class="pointer-events-none absolute border-4 border-gray-900 right-0 *:mx-auto rounded-2xl p-3 h-fit w-1/4 flex flex-col overflow-x-hidden">
        <img id="profile-picture" class="pointer-events-auto aspect-square size-40 rounded-full" src="${assetsPath}/pfp/default.jpg">
        <div id="pfp-preview-div" hidden class="relative">
          <p class="bg-gray-400 border px-1 top-2 rounded absolute">[[preview]]</p>
          <img id="pfp-preview" class="rounded-full aspect-square size-40" />
        </div>
        <input type="file" name="uploadfile" accept="image/*" id="pfp-input" style="display:none;"/>
        <label for="pfp-input" class="pointer-events-auto cursor-pointer bg-white rounded border border-gray-600 size-fit px-1" >[[upload image]]</label>
        <button title="[[will cause a reload]]"  class="pointer-events-auto bg-white rounded size-fit px-1 my-1 cursor-pointer" type="submit">[[update]]</button>
      </form>
      <form id="profile-form" class="p-3 flex flex-col justify-around size-full overflow-scroll">
        <input id="username-p1" value="" class="mt-auto ml-[15%] px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
        <div class="my-auto">
          <p class="text-white -ml-2">[[biography]]:</p>
          <textarea id="biography-p1" class="resize min-w-1/4 min-h-1/8 max-w-full max-h-full w-1/2 whitespace-pre-line px-1 text-white rounded bg-gray-500 wrap-break-word" name="biography"></textarea>
        </div>
        <button class="ml-[20%] bg-white rounded size-fit p-1 my-1 cursor-pointer" type="submit">[[update]]</button>
      </form>
    </div>
    <span class="relative border-4 border-gray-900 rounded-2xl p-3 w-full h-fit min-h-fit grid grid-flow-col overflow-hidden flex-none">
      <p class="absolute -top-1 -left-1 text-white size-fit px-2 py-1 rounded bg-amber-900">[[private infos]]</p>
      <form id="change-password-form" class="mt-5">
        <span class="flex gap-5 w-1/2">
          <div class="flex gap-2 flex-col p-1">
            <input placeholder="[[new password]]" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password">
            <input placeholder="[[confirm password]]" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
          </div>
          <button class="self-center whitespace-nowrap bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">[[change password]]</button>
        </span>
      </form>
      <form id="delete-account-form" class="mt-5 flex flex-col items-center">
        <input placeholder="[[confirm username]]" class="px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
        <button class="bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">[[erase account]]</button>
      </form>
    </span>
  </div>
  `,
  Profile2:
    `
  <div class="bg-[#1E244E] rounded-md p-3 size-full flex flex-col overflow-y-scroll">
    <header class="w-full flex items-start gap-4">
      <img
        id="profile-picture"
        class="ws-60 h-60 rounded-full aspect-square" src="${assetsPath}/default-avatar.jpg"
      >
      <div class="flex flex-col justify-start h-60">
        <h1 class="text-white text-6xl mt-10 mb-4 select-text font-Hammer" id="username-p2"></h1>
        <p class="text-white mb-1">[[biography]]:</p>
        <p class="w-150 h-full rounded-md p-1 bg-[#171C3D] text-[#D8D8D8] overflow-auto select-text" id="biography-p2"></p>
      </div>
      <img src="${assetsPath}/arrow-refresh.png" class=" size-10 cursor-pointer hover:animate-spin" onclick="main(true)"/>
    </header>
    <!--
    <span class="flex justify-around place-items-center">
      <style>
        .dropdown:hover .dropdown-content {display: flex;}
      </style>
      <div class="dropdown relative border px-1 rounded">
        <h1 class="text-white" id="username-p2"></h1>
        <div class="dropdown-content flex-col absolute z-1 *:whitespace-nowrap hidden size-fit *:px-1 bg-white *:hover:bg-gray-400">
          <a id="friend request">friend request</a>
          <a id="blocking request">block !</a>
        </div>
      </div>
    </span>
    -->
    <div class="transform-none">
      <div class="w-full h-px my-6 bg-gray-100 transform-[translateZ(0)]"></div>
    </div>
    <div class="w-full flex justify-center">
      <div class="bg-center w-175 h-25 rounded-2xl shadow-md" style="background: linear-gradient(79deg, #353C73, #424E9F);">
        <div class="size-full grid grid-cols-3 justify-items-stretch">
          <div class="flex grid-cols-3 my-auto justify-self-auto">
            <div class="text-2xl text-white font-bold ">RATIO<br>Victoire</div>
            <div class="text-shadow-amber-200 font-bold">100%</div>
          </div>
          <div class="flex grid-cols-3 border-x border-white my-auto justify-self-auto">
            <div class="text-white font-bold text-2xl text-center">PARTIE<br>Gagner</div>
            <div class="text-shadow-amber-200 text-5xl font-bold">6969</div>
          </div>
          <div class="flex grid-cols-3 my-auto justify-self-auto">
            <div class="text-white font-bold text-2xl text-center">PARTIE<br>Perdue</div>
            <div class="text-shadow-amber-200 font-bold">100%</div>
          </div>
        </div>
      </div>
    </div>
    <!--
    <p class="text-white -ml-2">[[biography]]:</p>
    <p class="text-white wrap-break-word min-h-8 h-fit min-w-1/4 w-fit max-w-full select-text bg-gray-700 rounded p-1 overflow-y-auto" id="biography-p2"></p>
    -->
    <table class="w-1/2 table-auto text-white bg-gray-700 border-collapse border border-gray-400 mt-10 mx-auto">
      <caption class="caption-bottom">[[remote counter]]</caption>
      <thead>
        <tr class="*:border *:border-gray-300 *:text-center">
          <th class="border border-gray-300" scope="col">[[wins]]</th>
          <th class="border border-gray-300" scope="col">[[loses]]</th>
          <th class="border border-gray-300" scope="col">[[w/l ratio]]</th>
        </tr>
      </thead>
      <tbody>
        <tr class="*:border *:border-gray-300 *:text-center">
          <td id="wins"></td>
          <td id="loses"></td>
          <td id="ratio"></td>
        </tr>
      </tbody>
    </table>
    <script>
      loadGameHistory();
      document.currentScript?.remove();
    </script>
    <table class="overflow-y-scroll w-1/2 h-full table-auto text-white bg-gray-700 border-collapse border border-gray-400 mt-10 mx-auto">
      <caption class="caption-bottom">[[remote counter]]</caption>
      <thead>
        <tr class="*:border *:border-gray-300 *:text-center">
          <th scope="col">[[winner]]</th>
          <th scope="col">[[loser]]</th>
          <th scope="col">[[date]]</th>
        </tr>
      </thead>
      <tbody id="history-tbody">
      </tbody>
    </table>
  </div>
  `,
  Friend: `
    <div class="bg-gray-800 rounded-2xl size-full overflow-hidden flex flex-col">
      <div id="friends-grid" class="grow grid grid-cols-4 grid-rows-4">
      <p class="col-span-full row-span-full m-auto text-white">it should load soon</p>
      </div>
      <script>
        loadFriendsDisplay();
        document.currentScript?.remove();
      </script>
      <span id="friends-span" class="px-3 h-15 py-2 relative border-3 border-y-gray-950">
        <img hidden src="${assetsPath}/arrow-right.png" class="h-10 absolute left-0 rotate-180 cursor-pointer" onclick="moveFriendsDisplay(-1)"/>
        <p class="absolute text-align-center my-auto left-1/2 -translate-x-1/2 text-3xl"></p>
        <img hidden src="${assetsPath}/arrow-right.png" class="h-10 absolute right-0 cursor-pointer" onclick="moveFriendsDisplay(1)"/>
      </span>
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
      <label class="text-white size-fit" for="username">[[username]]:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="text" name="username">
      <label class="text-white size-fit" for="password">[[password]]:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="password" name="password">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">[[login]]</button>
    </form>
    <form id="register-form">
      <label class="text-white size-fit" for="username">[[username]]:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="text" name="username">
      <label class="text-white size-fit" for="password">[[password]]:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password">
      <label class="text-white size-fit" for="password">[[confirm password]]:</label>
      <input spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">[[register]]</button>
    </form>
    <button id="goToGithub" onClick="loginWithGithub()" type="button" class="text-white bg-[#0f1419] hover:bg-gradient-to-r from-green-400 via-green-500 to-green-600
      focus:ring-4 focus:outline-none focus:ring-[#0f1419]/50 box-border border border-transparent font-medium leading-5 rounded-b text-sm px-4 py-2.5 text-center inline-flex items-center>
      <svg class="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"/></svg>>
      Sign in with Github
    </button>
    <div>
      <p class="text-white size-fit">[[Welcome]]</p>
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
    <h1 id=status class="text-white font-bold"></h1>
    <h2 id=message class="text-white"></h2>
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
  <div class="absolute top-2 -translate-x-1/2 left-1/2 w-1/2 h-fit bg-gray-300 rounded shadow-xl/50 *:text-black p-1 *:text-center">
  </div>
    `,
  Pong: `
  <div class="size-full flex flex-col">
  		<script  type="module" src="${assetsPath}/pong/main.js"></script>
		<button class="bg-gray-600 text-red-500 border place-self-start border-gray-400 px-1 rounded" onclick="newGame()">test</button>
		<canvas class="border border-white aspect-auto" id="canvas"></canvas>
	</div>
  `,
  ErrorMessageHandler:
    `
  <p name="error-handler" class="text-red-500 font-bold mb-2 pointer-events-auto select-text wrap-break-word"></p>
    `,
} as const;

/**
 * all the HTML (and CSS) of the Single-Page-Application (translated)
 */
export let htmlSnippets = {} as typeof htmlSnippetsTemplate;

// @ts-ignore
import en from '../languages/en.json' with { type: 'json' };
// @ts-ignore
import fr from '../languages/fr.json' with { type: 'json' };
// @ts-ignore
import es from '../languages/es.json' with { type: 'json' };

setLanguage();

/**
 * that function will set the var htmlSnippets to the language in the localStorage
 * If language not recognized or not set, will do english
*/
export function setLanguage(): void{
  let handled = {'en': en, 'fr': fr, 'es': es}
  let language = localStorage.getItem("language");
  if (language === null || !Object.hasOwn(handled, language)){
    language = 'en';
  }
  const translations = handled[language];

  Object.entries(htmlSnippetsTemplate).forEach(([name, snippet]) => {
    htmlSnippets[name] = snippet;
    for (let pattern in translations) {
      htmlSnippets[name] = htmlSnippets[name]
      .replaceAll(`[[${pattern}]]`, translations[pattern]);
    }
  });
}

export type languageString = [string, ...(string | languageString)[]] | string;
/**
 * select a string (or techinically anything) that correspond to localStorage["language"],
 * or the arg given if it's a string
 * 
 * @param strs examples: {'en': 'hello', 'fr': 'bonjour', 'es': 'hola'}, 'hey'
 * @returns the right string; else if localStorage["language"] not corresponding => str['en']; else if no str['en'] "language not found"
 */
export function selectLanguage(strs: languageString): string {
  if (typeof strs !== 'object') return String(strs);
  let res = findLanguage(strs[0]);
  for (let i = 1; i < strs.length; i++) {
    res = res.replaceAll(`[[${i - 1}]]`, selectLanguage(strs[i]))
  }
  return res;
}

/**
 * gives the string corresponding to name from the language jsons,
 * english if language not set in localStorage or not real
 * @param name the key for the jsons
 * @returns the string if found, "translation not found" if not
 */
export function findLanguage(name: string) {
  let handled = {'en': en, 'fr': fr, 'es': es}
  let language = localStorage.getItem('language');
  if (language === null || !Object.hasOwn(handled, language)) language = 'en';
  if (Object.hasOwn(handled[language], name)) return handled[language][name];
  return `translation not found => "${name}"`;
}