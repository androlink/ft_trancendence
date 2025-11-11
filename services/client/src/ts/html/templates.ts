
export const assetsPath = `/resources`;
const thenMain = `.then(main)`;
const catchErrorAndAlert = `.catch(err => alert('Caught: ' + err));`;

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
    <p class=" text-3xl font-mono text-blue-900 font-semibold select-none">ft_transcendence</p>
    <span class="justify-self-end flex gap-x-2">
      <select id="language-selector" title="[[will cause a reload]]" class="bg-gray-100 h-2/3 rounded px-1 cursor-pointer">
        <option value="en">English 🇬🇧</option>
        <option value="fr">Francais 🇫🇷</option>
        <option value="es">Español 🇪🇸</option>
      </select>
      <img src="${assetsPath}/exit-icon.png" onclick="if (self.isConnected) fetch('/logout', {method: 'POST'})${thenMain}${catchErrorAndAlert}" class="invert-50 select-none hover:animate-spin hover:invert-75 size-10 cursor-pointer" draggable="false">
    </span>
  </span>
  <span id="inner-buttons" class="flex gap-x-2 mx-8 *:px-1 *:cursor-pointer *:data-checked:cursor-default *:select-none *:rounded *:data-checked:text-white *:data-checked:bg-gray-500 *:bg-gray-700 *:text-gray-300">
    <div onclick="goToURL( )" name="">pdf</div>
    <div onclick="goToURL('game')" name="game">[[game]]</div>    
    <div onclick="goToURL('blank')" name="blank">debug</div>
    <div onclick="goToURL('pong')" name="pong">[[pong]]</div>
    <div onclick="goToURL('profile')" name="profile">[[your profile]]</div>
    <div onclick="goToURL('friends')" name="friends">[[your friends]]</div>
  </span>
  <span class="flex-1 min-h-0 grid grid-cols-4 h-full gap-x-2 mx-8 mb-8 mt-4 select-none">
    <div id="inner" class="h-full col-span-3 overflow-hidden"></div>
    <div class="h-full flex flex-col overflow-hidden">
      <div id="account-reconnected" hidden="" class="mb-2 rounded border bg-green-100 border-green-400 w-full h-fit flex justify-around flex-col items-center overflow-scroll">
        <p class="m-2 font-bold">[[auto reconnected]]</p>
      </div>
      <div id="account-disconnected" hidden="" class="mb-2 rounded border bg-red-200 border-red-400 w-full h-1/2 flex justify-around flex-col items-center overflow-scroll">
        <p class="m-2 font-bold">[[not connected]]</p>
        <button class="bg-white rounded size-fit p-1 cursor-pointer border border-red-400" onclick="goToURL('profile');">[[login page]]</button>
      </div>
      <div class="size-full bg-white flex flex-col">
        <div id="chat-content" class="overflow-y-scroll w-full h-0 grow *:px-1 *:wrap-break-word *:select-text *:whitespace-pre-line *:even:bg-gray-300 *:odd:bg-gray-100"></div>
        <span class="flex justify-items-stretch">
          <textarea id="chat-input" class="px-1 flex-1 field-sizing-fixed border-gray-700 focus:border-black border-2 focus:outline m-1 rounded resize-none"></textarea>
          <img src="${assetsPath}/send-icon.png" onclick="let d = document.getElementById('chat-input'); if (d && d.value) {sendMessage(d.value); d.value = '';}" class="self-center select-none invert-50 hover:invert-75 size-8 mr-1 cursor-pointer" draggable="false">
        </span>
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
        <input title="username" id="username-p1" value="" class="mt-auto ml-[15%] px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
        <div class="my-auto">
          <p class="text-white -ml-2">[[biography]]:</p>
          <textarea title="biography" id="biography-p1" class="resize min-w-1/4 min-h-1/8 max-w-full max-h-full w-1/2 whitespace-pre-line px-1 text-white rounded bg-gray-500 wrap-break-word" name="biography"></textarea>
        </div>
        <button class="ml-[20%] bg-white rounded size-fit p-1 my-1 cursor-pointer" type="submit">[[update]]</button>
      </form>
    </div>
    <span class="relative border-4 border-gray-900 rounded-2xl p-3 w-full h-fit min-h-fit grid grid-flow-col overflow-hidden flex-none">
      <p class="absolute -top-1 -left-1 text-white size-fit px-2 py-1 rounded bg-amber-900">[[private infos]]</p>
      <form id="change-password-form" class="mt-5">
        <span class="flex gap-5 w-1/2">
          <div class="flex gap-2 flex-col p-1">
            <input title="password" placeholder="[[new password]]" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password">
            <input title="password" placeholder="[[confirm password]]" class="px-1 text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
          </div>
          <button class="self-center whitespace-nowrap bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">[[change password]]</button>
        </span>
      </form>
      <form id="delete-account-form" class="mt-5 flex flex-col items-center">
        <input placeholder="[[confirm username]]" title="username" class="px-1 text-white rounded bg-gray-500 size-fit" type="text" name="username">
        <button class="bg-white rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">[[erase account]]</button>
      </form>
    </span>
  </div>
  `,
  Profile2:
    `
  <div class="bg-gray-800 rounded-2xl p-3 size-full flex flex-col overflow-y-scroll relative">
    <img src="${assetsPath}/arrow-refresh.png" class="absolute size-10 right-3 cursor-pointer hover:animate-spin" onclick="main(true)"/>
    <span class="flex justify-around place-items-center">
      <style>
        .dropdown:hover .dropdown-content {display: flex;}
      </style>
      <div class="dropdown relative border px-1 rounded">
        <h1 class="text-white" id="username-p2"></h1>
        <div class="dropdown-content flex-col absolute z-1 *:whitespace-nowrap hidden size-fit cursor-pointer *:px-1 bg-white *:hover:bg-gray-400">
          <a id="friend request">friend request</a>
          <a id="blocking request">block !</a>
        </div>
      </div>
      <img id="profile-picture" class="size-50 rounded-full" src="${assetsPath}/default-avatar.jpg">
    </span>
    <p class="text-white -ml-2">[[biography]]:</p>
    <p class="text-white wrap-break-word min-h-8 h-fit min-w-1/4 w-fit max-w-full select-text bg-gray-700 rounded p-1 overflow-y-auto" id="biography-p2"></p>
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
      <input title="username" spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="text" name="username">
      <label class="text-white size-fit" for="password">[[password]]:</label>
      <input title="password" spellcheck="false" class="text-white rounded bg-gray-500 size-fit px-1" type="password" name="password">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">[[login]]</button>
    </form>
    <form id="register-form">
      <label class="text-white size-fit" for="username">[[username]]:</label>
      <input title="username" spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="text" name="username">
      <label class="text-white size-fit" for="password">[[password]]:</label>
      <input title="password" spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password">
      <label class="text-white size-fit" for="password">[[confirm password]]:</label>
      <input title="password" spellcheck="false" class="text-white rounded bg-gray-500 size-fit" type="password" name="password-confirm">
      <button class="absolute left-3/4 bottom-0 -translate-x-1/2 translate-y-1/2 bg-gray-600 ring-3 ring-gray-500 text-white rounded px-1 hover:cursor-pointer" type="submit">[[register]]</button>
    </form>
    <div>
      <p class="text-white size-fit">Google auth and stuff</p>
    </div>
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
  		<script  type="module" src="${assetsPath}/pong/pong.js"></script>
		<canvas class="border border-white aspect-auto" id="canvas"></canvas>
	</div>
  `,
  ErrorMessageHandler:
    `
  <p name="error-handler" class="text-red-500 font-bold mb-2 pointer-events-auto select-text wrap-break-word"></p>
    `
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

/**
 * select a string (or techinically anything) that correspond to localStorage["language"],
 * or the arg given if it's a string
 * 
 * @param strs examples: {'en': 'hello', 'fr': 'bonjour', 'es': 'hola'}, 'hey'
 * @returns the right string; else if localStorage["language"] not corresponding => str['en']; else if no str['en'] "language not found"
 */
export function selectLanguage(strs: {[key:string]: string} | string): string {
  if (typeof strs === 'string') return strs;
  let language = localStorage.getItem('language');
  if (language === null) language = 'en';
  if (Object.hasOwn(strs, language)) return strs[language];
  if (Object.hasOwn(strs, 'en')) return strs['en'];
  return 'language not found';
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