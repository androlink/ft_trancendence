export const assetsPath = `/resources`;

/**
 * all the HTML (and CSS) of the Single-Page-Application (not translated yet)
 */
const htmlSnippetsTemplate: {
  readonly Home: string;
  readonly Pong: string;
  readonly Profile1: string;
  readonly Profile2: string;
  readonly Friend: string;
  readonly LogIn: string;
  readonly Error: string;
  readonly Ouch: string;
  readonly PopUp: string;
  readonly ErrorMessageHandler: string;
  readonly Welcome: string;
  RemotePong: string;
} = {
  Home: `

  <span class="relative flex justify-between grid-cols-3 mx-8 my-2">

    <div class="relative">
      <div class="gap-1 flex group rounded-md p-2.5 bg-[#1b1e38] border border-white placeholder-gray-400 text-white  focus-within:border-blue-500">
        <svg version="1.0" class="flex size-5 fill-current group-focus-within:text-blue-500 text-white "
          xmlns="http://www.w3.org/2000/svg"
          width="400.000000pt" height="400.000000pt" viewBox="0 0 400.000000 400.000000"
          preserveAspectRatio="xMidYMid meet">
            <g transform="translate(0.000000,400.000000) scale(0.100000,-0.100000)"
              fill="currentColor" stroke="none">
              <path d="M1535 3485 c-133 -18 -207 -41 -343 -107 -192 -92 -338 -211 -455
              -371 -45 -62 -64 -93 -118 -197 -69 -131 -120 -356 -119 -529 1 -164 45 -352
              120 -506 206 -427 620 -688 1090 -688 273 0 486 72 738 250 23 16 26 13 440
              -399 229 -229 427 -421 439 -427 93 -47 209 69 162 162 -6 12 -198 209 -426
              438 -293 294 -413 421 -408 430 5 8 21 30 37 50 15 20 28 40 28 45 0 4 6 15
              14 23 22 24 82 149 111 229 90 250 92 545 5 797 -95 275 -302 519 -565 666
              -222 124 -484 171 -750 134z m437 -274 c301 -90 509 -285 642 -603 27 -64 49
              -209 49 -318 1 -317 -154 -610 -415 -787 -164 -112 -332 -164 -533 -166 -114
              0 -256 21 -323 50 -167 70 -253 125 -356 227 -122 120 -201 253 -252 426 -25
              86 -28 110 -28 250 0 136 4 166 26 246 80 283 263 501 521 623 142 68 274 92
              454 85 95 -4 144 -11 215 -33z"/>
            </g>
        </svg>

        <input id="user-search" type="search" spellcheck="false" placeholder="[[username]]" class="flex placeholder:italic text-sm select-none focus:outline-none w-2/3"/>
        <!-- div below must stay right after the input above, even empty, or we have to change the way the predictions display -->
        <div class="absolute overflow-y-scroll z-40 max-h-5/1 w-full flex flex-col top-10 -left-0.5 border border-white rounded empty:border-none empty:border-[#fff0]"></div>
      </div>
    </div>
    <input type="text" maxLength=20 value="ft_ ¯\\\\_(ツ)_/¯" class="text-3xl font-mono text-center text-white font-semibold select-none"/>
    <script>
    {
      const ft_title = document.currentScript.previousElementSibling;
      ft_title.value = self.localStorage.getItem("ft_title") || "ft_ ¯\\\\_(ツ)_/¯";
      ft_title.onchange = () => self.localStorage.setItem("ft_title", ft_title.value);
      document.currentScript.remove();
    }
    </script>
    <span class="justify-self-end flex gap-x-2">
      <select id="language-selector" title="[[will cause a reload]]" class="my-auto bg-gray-100 h-2/3 rounded px-1 cursor-pointer">
        <option value="en">English 🇬🇧</option>
        <option value="fr">Francais 🇫🇷</option>
        <option value="es">Español 🇪🇸</option>
      </select>
      <svg version="1.0"
        class=" mt-1.5 fill-current text-white hover:text-blue-500 select-none size-9 cursor-pointer"
        onclick="accountLogOut()"
        draggable="false"
        xmlns="http://www.w3.org/2000/svg"
        width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"
        preserveAspectRatio="xMidYMid meet">

        <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
          fill="currentColor" stroke="none">
          <path d="M751 4796 c-53 -29 -50 72 -51 -1837 0 -1678 1 -1778 18 -1797 25
          -31 1603 -852 1635 -852 15 0 41 12 59 29 l33 29 3 376 3 376 382 0 c361 0
          384 1 414 20 21 13 35 31 42 57 16 57 14 1347 -2 1393 -17 48 -67 76 -115 64
          -20 -5 -44 -21 -56 -37 -21 -28 -21 -37 -24 -663 l-3 -634 -319 0 -320 0 -2
          1310 -3 1310 -25 24 c-14 13 -286 160 -605 326 -319 167 -584 307 -589 311 -6
          5 409 9 927 9 l936 0 3 -619 3 -620 29 -30 c41 -42 92 -43 138 -2 l33 29 3
          661 c2 453 -1 674 -8 702 -8 28 -21 46 -43 59 -31 19 -60 20 -1252 20 -994 -1
          -1224 -3 -1244 -14z"/>
          <path d="M3709 3811 c-41 -42 -39 -83 9 -157 21 -32 120 -175 220 -317 100
          -142 182 -260 182 -262 0 -3 -331 -6 -736 -7 l-736 -3 -29 -33 c-39 -43 -39
          -90 -1 -132 l27 -31 738 1 c507 0 737 -3 737 -10 0 -6 -99 -152 -220 -324
          -191 -272 -220 -318 -220 -350 0 -28 7 -45 29 -67 42 -41 90 -40 135 3 18 18
          156 207 305 420 235 334 271 391 271 423 0 32 -36 89 -271 423 -149 213 -287
          402 -305 420 -45 43 -93 44 -135 3z"/>
        </g>
        </svg>
    </span>
    <div id="notif" class="hidden p-3 text-lg text-white z-50 text-center fixed top-0 left-1/2 opacity-0 self-center-safe justify-center rounded-md shadow-lg bg-red-500">[[not connected]]</div>

  </span>
  <div class="transform-none">
    <div class="w-full h-px my-2 bg-gray-100 transform-[translateZ(0)]"></div>
  </div>
  <span id="inner-buttons" class="flex gap-x-0.5 mx-8 *:px-1 *:cursor-pointer *:data-checked:cursor-default *:select-none *:rounded-t *:data-checked:text-white *:data-checked:bg-[#262d5f] *:bg-[#1b1e38] *:text-gray-300">
    <div onclick="goToURL( )" name="">🏠</div>
    <div onclick="goToURL('pong')" name="pong">[[pong]]</div>
    <div onclick="goToURL('profile')" name="profile">[[your profile]]</div>
    <div onclick="goToURL('friends')" name="friends">[[your friends]]</div>
    <div onclick="goToURL('help')" name="help">?</div>
  </span>
  <span class=" flex-1 min-h-0 grid grid-cols-4 h-full gap-x-2 mx-8 mb-8 select-none drop-shadow-xl/50">
    <div id="inner" class="h-full col-span-3 overflow-hidden relative"></div>
    <div class="h-full flex flex-col overflow-hidden">
      <div class="rounded-md overflow-hidden size-full bg-[#E9E9E9] flex flex-col">
        <div id="chat-content" class=" overflow-y-scroll w-full h-0 grow *:px-1 *:wrap-break-word *:select-text *:whitespace-pre-line *:even:bg-gray-300 *:odd:bg-gray-100"></div>
        <div class=" relative mx-4 mb-4 flex bg-white rounded ">
        <textarea id="chat-input" class="w-full justify-items-stretch my-0.5 px-1 resize-none" placeholder="[[send a message]]" maxlength="280"></textarea>

        <svg class="mx-2 justify-items-end self-center select-none fill-current text-[#8B2CF5] hover:text-blue-500 size-10 cursor-pointer"
        onclick="let d = document.getElementById('chat-input'); if (d && d.value) {sendChatMessage(d.value);}"
        draggable="false"
        xmlns="http://www.w3.org/2000/svg"
        width="44.000000pt" height="46.000000pt" viewBox="0 0 44.000000 46.000000"
        preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,46.000000) scale(0.100000,-0.100000)"
        fill="currentColor" stroke="none">
        <path d="M210 332 c-102 -26 -187 -47 -189 -48 -1 -2 11 -21 29 -43 22 -27 34 -54 37 -86 6 -45 6 -45 38 -39 27 5 41 -1 82 -29 l49 -36 86 165 c63 120 81 164 69 163 -9 -1 -99 -22 -201 -47z m129 -18 c-25 -27 -211 -164 -223 -164 -3 0 -6 15 -6 33 0 31 3 34 123 94 67 34 124 62 126 62 3 1 -6 -11 -20 -25z"/>
        </g>
        </svg>

        <div id="account-disconnected" hidden="" class="size-full absolute z-10 rounded-md bg-white cursor-pointer" onclick="goToURL('profile'); showNotification('[[not connected]]', 'red-500');">
          <div class="m-auto text-gray-500 text-center text-lg">[[not connected]]</div>
        </div>
        </div>
      </div>
    </div>
  </span>
  `,
  Profile1: `
  <div class="h-full flex justify-center rounded-md bg-[#262d5f]">
    <div class="w-full mt-5 overflow-y-auto max-w-4xl px-4 sm:px-8 border-x border-t border-white bg-[#171C3D] shadow-2xl rounded-t-lg">

    <div class="flex">
      <div class="text-4xl text-white px-3 mt-1">[[public infos]]</div>
      <svg version="1.0"
        id="go-to-profile"
        class="p-1.5 mt-2 justify-items-end self-center select-none fill-current text-white hover:text-blue-500 size-10 cursor-pointer"
        draggable="false"
        xmlns="http://www.w3.org/2000/svg"
        width="400.000000pt" height="400.000000pt" viewBox="0 0 400.000000 400.000000"
        preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,400.000000) scale(0.100000,-0.100000)"
            fill="currentColor" stroke="none">
              <path d="M639 3737 c-79 -53 -102 -142 -55 -215 13 -20 355 -368 760 -772 405
              -404 736 -742 736 -750 0 -8 -329 -344 -731 -745 -402 -402 -744 -748 -760
              -769 -54 -73 -33 -167 50 -223 41 -28 109 -31 149 -6 43 26 1742 1726 1742
              1743 0 17 -1699 1717 -1742 1743 -40 25 -108 22 -149 -6z"/>
              <path d="M1679 3737 c-79 -53 -102 -142 -55 -215 13 -20 355 -368 760 -772
              405 -404 736 -742 736 -750 0 -8 -329 -344 -731 -745 -402 -402 -744 -748
              -760 -769 -54 -73 -33 -167 50 -223 41 -28 109 -31 149 -6 43 26 1742 1726
              1742 1743 0 17 -1699 1717 -1742 1743 -40 25 -108 22 -149 -6z"/>
          </g>
      </svg>
    </div>
      <div class="transform-none">
          <div class="mx-auto my-3 h-px transform-[translateZ(0)] bg-gray-600"></div>
      </div>

      <form id="pfp-form" class="flex flex-col ">
          <div class="relative flex flex-col">
            <div class="relative my-6 w-40 h-40 mx-auto">
              <div class=" rounded-full overflow-hidden w-full h-full">
                <img id="profile-picture" class="object-center object-cover w-full h-full" src="${assetsPath}/default-avatar.jpg" />
              </div>
              <input type="file" name="uploadfile" accept="image/*" id="pfp-input" style="display:none;"/>

              <div id="pfp-preview-div" hidden>
                <div class="absolute inset-0 rounded-full overflow-hidden w-full h-full">
                  <img id="pfp-preview" class="w-full h-full object-center object-cover bg-[#171C3D]" />
                </div>
                <p class="absolute top-2 bg-gray-400 border px-1 rounded ">preview</p>
              </div>
              <label for="pfp-input" class="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-purple-500 border-2 border-[#171C3D] hover:bg-blue-400 transition">
                <img src="${assetsPath}/Pencil.svg" class="fill-white px-2"/>
              </label>
            </div>
            <button id="update-pfp" hidden class=" mx-auto size-fit cursor-pointer rounded bg-purple-500 p-1 text-white hover:bg-blue-400" type="submit">[[update]]</button>
          </div>
      </form>

      <form id="profile-form" class="flex flex-col gap-5 px-6 py-4">
          <div class="mx-auto flex size-fit w-full max-w-4xl  flex-col justify-items-center gap-5">
            <div class="group flex flex-col justify-items-center rounded border border-gray-400 focus-within:border-blue-400 p-1 transition-colors duration-250">
                <div class="flex items-center justify-between">
                  <p class="mb-1 text-white group-focus-within:text-blue-400">[[username]]:</p>
                  <p id="usernameCount" class="px-1 text-gray-500 opacity-0 group-focus-within:opacity-100">0/20</p>
                </div>
                <input id="username-p1" value="" class="p-1 rounded text-white select-text focus:bg-[#171c3d71] outline-none" type="text" name="username" maxlength="20" />
            </div>
            <div class="group w-full rounded border border-gray-400 focus-within:border-blue-400 p-1 transition-colors duration-150">
                <div class="flex items-center justify-between">
                  <p class="mb-1 text-white  group-focus-within:text-blue-400">[[biography]]:</p>
                  <p id="bioCount" class="px-1 text-gray-500 opacity-0 group-focus-within:opacity-100">0/400</p>
                </div>
                <textarea id="biography-p1" class="flex w-full resize-y overflow-auto rounded-md p-1 outline-none min-h-10 max-h-50 text-[#D8D8D8] select-text" maxlength="400" name="biography"> </textarea>
            </div>
          </div>
          <button id="update-infos" class="hidden mx-auto my-4 size-fit cursor-pointer rounded bg-purple-500 p-1 text-white hover:bg-blue-400" type="submit">[[update]]</button>
      </form>

      <div class="text-4xl text-white px-3">[[private infos]]</div>
      <div class="transform-none">
          <div class="mx-auto my-3 h-px transform-[translateZ(0)] bg-gray-600"></div>
      </div>

      <div class="flex flex-col items-center">
          <form id="change-password-form" class="mt-5">
          <div class="text-white text-2xl" id="label-change-password">[[change password]]</div>
          <div class="flex flex-col sm:flex-row gap-5 mb-6">
            <div class="flex gap-2 flex-col p-1">
              <input placeholder="[[new password]]" class="px-1 h-8 w-full rounded border border-gray-400 focus-within:border-blue-400 text-white outline-none" type="password" name="password">
              <input placeholder="[[confirm password]]"px-1 class="h-8 w-full rounded border border-gray-400 focus-within:border-blue-400 text-white outline-none" type="password" name="password-confirm">
            </div>
            <button class="self-center whitespace-nowrap bg-purple-500 text-white hover:bg-blue-400 rounded size-fit p-1 my-1 hover:cursor-pointer" type="submit">[[submit]]</button>
          </div>
          </form>
      </div>

      <div class="text-4xl text-red-500 px-3">[[erase account]]</div>
      <div class="transform-none">
          <div class="mx-auto my-3 h-px transform-[translateZ(0)] bg-gray-600"></div>
      </div>

      <div class="flex flex-col items-center my-4">
        <form id="delete-account-form" class="mt-2 flex flex-col items-center gap-2">
          <input placeholder="[[confirm username]]" class="px-1 h-8 w-full rounded border border-gray-400 focus-within:border-blue-400 text-white outline-none" type="text" name="username">
          <button class="self-center whitespace-nowrap bg-purple-500 text-white hover:bg-red-500 hover:font-bold rounded size-fit p-1 my-1 hover:cursor-pointer transition-colors" type="submit">[[submit]]</button>
        </form>
      </div>
    </div>
  </div>

  `,
  Profile2: `
  <div class="bg-[#262d5f] rounded-md p-3 size-full flex flex-col overflow-y-scroll">
    <header class="w-full flex items-start gap-4">
      <img
        id="profile-picture"
        class="ws-60 h-60 rounded-full border-2 border-gray-600 aspect-square" src="${assetsPath}/default-avatar.jpg"
      >
      <div class="flex flex-col justify-start h-60">
        <div class ="flex flex-row *:mt-10 *:mb-4">
          <h1 class="text-white select-text font-Hammer text-6xl" id="username-p2"></h1>
          <div class="relative dropdown px-1">
            <style>
              .dropdown:hover .dropdown-content {display: flex;}
            </style>
            <img src="${assetsPath}/menu-vertical.png" class="mt-5 size-10 cursor-pointer"></img>
            <div class="dropdown-content flex-col absolute top-10 z-1 *:whitespace-nowrap hidden size-fit m-2 border border-white">
              <ul class ="*:hover:bg-[#ffffff7c] *:px-1 *:text-white *:hover:text-white bg-[#1b1e38d0]">
                <li>
                  <a id="friend request">friend request</a>
                </li>
                <li>
                  <a id="blocking request">block !</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p class="text-white mb-1">[[biography]]</p>
        <p class=" flex w-[250] h-full rounded-md p-1 border-2 border-gray-900 bg-[#171C3D] text-[#D8D8D8] overflow-auto select-text resize-y min-h-10 max-h-[40vh]" id="biography-p2"></p>
      </div>
    </header>
    <div class="transform-none">
      <div class="w-full h-px my-6 bg-gray-100 transform-[translateZ(0)]"></div>
    </div>
    <div class="w-full flex justify-center">
      <div class="bg-center w-175 h-25 rounded-2xl border border-gray-200 py-3 shadow-md" style="background: linear-gradient(79deg, #353C73, #424E9F);">
        <div class="size-full grid grid-cols-3 mx-1 justify-items-stretch">
          <div class="grid grid-cols-3 px-3 border-r-2 border-gray-200 *:my-auto">
            <h2 class="text-white font-bold text-2xl text-center">[[w/l ratio]]</h2>
            <h2 id="ratio" class="text-amber-200 font-bold text-4xl text-center col-start-2 col-span-2"></h1>
          </div>
          <div class="grid grid-cols-3 px-3 *:my-auto">
            <h2 class="text-white font-bold text-2xl text-center"><span class="block">[[wins]]</h2>
            <h2 id="wins" class="text-[#96DF9F] font-bold text-4xl text-center col-start-2 col-span-2"></h2>
          </div>
          <div class="grid grid-cols-3 px-3  border-l-2 border-gray-200 *:my-auto">
            <h2 class="text-white font-bold text-2xl texIt-center"><span class="block">[[losses]]</h2>
            <h2 id="losses" class="text-[#DF9696] font-bold text-4xl text-center col-start-2 col-span-2 "></h2>
          </div>
        </div>
      </div>
    </div>

    <script>
      loadGameHistory();
      document.currentScript?.remove();
    </script>
    <div class="m-4 bg-center mx-auto p-4 w-full md:w-200 rounded-2xl border border-gray-200 bg-[#171C3D] flex flex-col">
      <div class="grid grid-cols-10 text-white items-center text-center mb-2">
        <span class="col-span-3">[[winner]]</span>
        <span class="col-span-3">[[loser]]</span>
        <span class="col-span-4">[[date]]</span>
      </div>
      <div id="history-tbody">
      </div>
    </div>
  </div>
  `,
  Friend: `
    <div class="bg-[#262d5f] rounded-md size-full flex flex-col">
      <div class=" flex-1 max-h-[125] overflow-y-auto">
        <div id="friends-grid" class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2 grid-auto-rows-[60px]">
          <p class="col-span-full row-span-full m-auto text-white">it should load soon</p>
        </div>
      </div>

      <span id="friends-span" class="flex h-16 px-4 justify-center items-center bg-[#262d5f] border-t border-white *:text-white rounded-b-md ">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="h-10 absolute px-2 left-0 rotate-180 cursor-pointer text-white fill-current"
          onclick="moveFriendsDisplay(-1)"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet">

            <g transform="translate(400,0) scale(-0.1,0.1)"
            fill="currentColor" stroke="none">
            <path d="M2440 3484 c-39 -16 -1401 -1370 -1426 -1416 -22 -42 -18 -103 10
            -146 13 -20 334 -346 713 -724 616 -614 692 -687 726 -694 50 -9 109 9 148 44
            33 30 59 106 51 150 -3 13 -146 307 -318 652 -173 345 -314 638 -314 650 0 12
            141 305 314 650 172 345 315 639 318 652 7 35 -15 114 -38 139 -24 27 -91 59
            -124 58 -14 0 -41 -7 -60 -15z"/>
            </g>
        </svg>


        <p class="absolute text-align-center my-auto left-1/2 -translate-x-1/2 text-3xl"></p>

        <svg xmlns="http://www.w3.org/2000/svg"
          class="h-10 absolute px-2 right-0 rotate-180 cursor-pointer text-white fill-current"
          onclick="moveFriendsDisplay(1)"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet">

            <g transform="translate(0.000000,400.000000) scale(0.100000,-0.100000)"
            fill="currentColor" stroke="none">
            <path d="M2440 3484 c-39 -16 -1401 -1370 -1426 -1416 -22 -42 -18 -103 10
            -146 13 -20 334 -346 713 -724 616 -614 692 -687 726 -694 50 -9 109 9 148 44
            33 30 59 106 51 150 -3 13 -146 307 -318 652 -173 345 -314 638 -314 650 0 12
            141 305 314 650 172 345 315 639 318 652 7 35 -15 114 -38 139 -24 27 -91 59
            -124 58 -14 0 -41 -7 -60 -15z"/>
            </g>
        </svg>
      </span>

      <script>
        loadFriendsDisplay();
        document.currentScript?.remove();
      </script>
    </div>
  `,
  LogIn: `
  <div class="flex min-h-full items-center justify-center rounded-md bg-[#262d5f] p-3">
    <div class="w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col rounded-md border border-gray-200 bg-[#171C3D] p-5 shadow-2xl">
      <form id="log-in-form" class="mx-8 my-6 flex flex-col gap-3 rounded-md text-white" hidden>
        <div class="my-5 mb-10 text-center text-4xl font-bold">[[log in]]</div>
        <input spellcheck="false" class="[#2c304d00] flex rounded bg-linear-to-tr to-[#2c304d] px-1 py-2 text-lg sm:text-xl md:text-2xl" type="text" name="username" placeholder="[[username]]" />
        <input spellcheck="false" class="[#2c304d00] flex rounded bg-linear-to-tr to-[#2c304d] px-1 py-2 text-lg sm:text-xl md:text-2xl" type="password" name="password" placeholder="[[password]]" />

        <button class="my-1 rounded-sm bg-purple-600 py-2 text-2xl font-bold shadow-2xl hover:bg-blue-500 cursor-pointer">[[log in]]</button>

        <button id="goToGithub" onClick="logInWithGithub()" type="button" class="gap-2 rounded bg-[#0f1419] from-green-400 via-green-500 to-green-600 px-4 py-2 text-[135%] hover:bg-linear-to-r shadow-2xl mb-5 cursor-pointer">
          <svg class="inline-flex h-8 w-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"></path>
          </svg>
          [[log in github]]
        </button>
        <span>
          pas de compte ?
          <span onclick="document.getElementById('register-form').hidden = false; document.getElementById('log-in-form').hidden = true" class=" text-blue-500 hover:underline hover:text-blue-500 hover:cursor-pointer">[[register]]</span>
        </span>
      </form>
      <form id="register-form" class="mx-8 my-6 flex flex-col gap-3 rounded-md text-white">
        <div class="mt-5 text-center text-4xl font-bold">[[register]]</div>
        <input spellcheck="false" class="[#2c304d00] flex rounded bg-linear-to-tr to-[#2c304d] px-1 py-2 text-lg sm:text-xl md:text-2xl" type="text" name="username" placeholder="[[username]]" />
        <input spellcheck="false" class="[#2c304d00] flex rounded bg-linear-to-tr to-[#2c304d] px-1 py-2 text-lg sm:text-xl md:text-2xl" type="password" name="password" placeholder="[[password]]" />
        <input spellcheck="false" class="[#2c304d00] flex rounded bg-linear-to-tr to-[#2c304d] px-1 py-2 text-lg sm:text-xl md:text-2xl" type="password" name="password-confirm" placeholder="[[confirm password]]" />

        <button class="my-1 rounded-sm bg-purple-600 py-2 text-2xl font-bold shadow-2xl hover:bg-blue-500 cursor-pointer">[[register]]</button>

        <button id="goToGithub" onClick="logInWithGithub()" type="button" class="gap-2 rounded bg-[#0f1419] from-green-400 via-green-500 to-green-600 px-4 py-2 text-[135%] hover:bg-linear-to-r shadow-2xl cursor-pointer">
          <svg class="inline-flex h-8 w-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clip-rule="evenodd"></path>
          </svg>
          [[register github]]
        </button>
        <span>
          [[already an account]]
          <span onclick="document.getElementById('log-in-form').hidden = false; document.getElementById('register-form').hidden = true" class=" text-blue-500 hover:underline hover:text-blue-500 hover:cursor-pointer">[[log in]]</span>
        </span>
      </form>
    </div>
  </div>
  `,
  Error: `
  <div class="flex flex-col items-center size-1/2 m-40 place-self-center">
    <h1 id=status class="text-white font-bold"></h1>
    <h2 id=message class="text-white"></h2>
    <img src="${assetsPath}/error.png" alt="error" class="justify-self-start select-none h-full" draggable="false">
    <button onclick="goToURL( )" type="button" class="cursor-pointer data-checked:cursor-default select-none rounded hover:text-white hover:bg-gray-500 bg-gray-700 text-gray-300 px-1">home</button>
  </div>
  `,

  Ouch: `
  <iframe id="container-iframe" class="size-full bg-gray-200" srcdoc="">
  </iframe>
  `,
  PopUp: `
    <div class="absolute top-2 -translate-x-1/2 left-1/2 w-1/2 h-fit border border-white bg-[#171C3D] rounded shadow-xl/50 *:text-white p-1 *:text-center">
      <p>[[pop_up_shortcuts]]<br>[[pop up]]<br></p>
    </div>
    `,
  Pong: `
  <div class="relative size-full flex flex-col overflow-scroll bg-[#262d5f] rounded-md">
    <h2 class="text-white justify-center self-center-safe p-4 text-5xl font-bold cursor-pointer" onclick="window.dispatchEvent(new PopStateEvent('popstate')); resetNextInner(); main({requests: false})">PONG</h2>
    <script id="local config">
      loadLocalConfig();
    </script>
    <canvas class=" size-full" id="canvas"></canvas>
  </div>
  `,
  RemotePong: `
  <div class="relative size-full flex flex-col overflow-scroll bg-">
    <script>
    document.currentScript?.remove();
    </script>
    <canvas class="size-full" id="canvas"></canvas>
  </div>
  `,
  ErrorMessageHandler: `
  <p name="error-handler" class="text-red-500 font-bold mb-2 pointer-events-auto select-text wrap-break-word"></p>
    `,
  Welcome: `
    <div id="physics-zone" class="flex flex-col items-center overflow-y-scroll h-full rounded-b-md rounded-tr-md bg-[#262d5f]">
      <h1 id="Title" data-physics  class="text-white wrap-break-word whitespace-pre mx-auto my-20 2xl:text-10xl xl:text-9xl md:text-7xl sm:text-6xl text-center">welcome to <br>¯\\\\_(ツ)_/¯</h1>
      <script>
      {
        const ft_title = document.currentScript.previousElementSibling;
        ft_title.textContent = selectLanguage(["Welcome to", self.localStorage.getItem("ft_title") || "ft_ ¯\\\\_(ツ)_/¯"]);
        document.currentScript.remove();
      }
      </script>
      <button class="text-white font-semibold text-2xl rounded-[20px] size-fit px-4 py-2 bg-purple-600 mx-auto hover:bg-blue-500"
        onclick="goToURL(localStorage.getItem('token') ? 'pong' : 'profile')">Start</button>
    </div>
  `,
} as const;
/**
 * all the HTML (and CSS) of the Single-Page-Application (translated)
 */
export let htmlSnippets = {} as typeof htmlSnippetsTemplate;

// @ts-ignore
import en from "../languages/en.json" with { type: "json" };
// @ts-ignore
import fr from "../languages/fr.json" with { type: "json" };
// @ts-ignore
import es from "../languages/es.json" with { type: "json" };

setLanguage();

/**
 * that function will set the var htmlSnippets to the language in the localStorage
 * If language not recognized or not set, will do english
 */
export function setLanguage(): void {
  let handled = { en: en, fr: fr, es: es };
  let language = localStorage.getItem("language");
  if (language === null || !Object.hasOwn(handled, language)) {
    language = "en";
  }
  const translations = handled[language];

  Object.entries(htmlSnippetsTemplate).forEach(([name, snippet]) => {
    htmlSnippets[name] = snippet;
    for (let pattern in translations) {
      htmlSnippets[name] = htmlSnippets[name].replaceAll(
        `[[${pattern}]]`,
        translations[pattern]
      );
    }
  });
}

export type languageString = [string, ...(string | languageString)[]] | string;
/**
 * select a string (or techinically anything) that correspond to localStorage["language"],
 * or the arg given if it's a string
 *
 * @param strs examples: ["hello user", 'geymat']
 * @returns the right string; else if localStorage["language"] not corresponding => str['en']; else if no str['en'] "translation not found"
 */
export function selectLanguage(strs: languageString): string {
  if (!Array.isArray(strs)) return String(strs);
  let res = findLanguage(strs[0]);
  for (let i = 1; i < strs.length; i++) {
    res = res.replaceAll(`[[${i - 1}]]`, selectLanguage(strs[i]));
  }
  return res;
}
self["selectLanguage"] = selectLanguage;

/**
 * gives the string corresponding to name from the language jsons,
 * english if language not set in localStorage or not real
 * @param name the key for the jsons
 * @returns the string if found, "translation not found" if not
 */
export function findLanguage(name: string): string {
  const handled = { en, fr, es };
  let language = localStorage.getItem("language");
  if (language === null || !Object.hasOwn(handled, language)) language = "en";
  if (Object.hasOwn(handled[language], name)) return handled[language][name];
  return `translation not found => "${name}"`;
}

export function countCharacter() {
  const userContent = document.getElementById(
    "username-p1"
  ) as HTMLInputElement;
  const bioContent = document.getElementById(
    "biography-p1"
  ) as HTMLTextAreaElement;
  const userCount = document.getElementById(
    "usernameCount"
  ) as HTMLParagraphElement;
  const bioCount = document.getElementById("bioCount") as HTMLParagraphElement;

  if (!userContent || !bioContent || !userCount || !bioCount) return;

  userCount.textContent = `${userContent.value.length}/20`;
  bioCount.textContent = `${bioContent.value.length}/400`;

  userContent.addEventListener("input", () => {
    const parentDiv = userContent.parentNode as HTMLDivElement;
    if (userContent.value.length >= 20) {
      parentDiv.classList.add("focus-within:border-red-500");
      setTimeout(() => {
        parentDiv.classList.remove("focus-within:border-red-500");
      }, 150);
    }
    userCount.textContent = `${userContent.value.length}/20`;
  });
  bioContent.addEventListener("input", () => {
    const parentDiv = bioContent.parentNode as HTMLDivElement;
    if (bioContent.value.length >= 400) {
      parentDiv.classList.add("focus-within:border-red-500");
      setTimeout(() => {
        parentDiv.classList.remove("focus-within:border-red-500");
      }, 150);
    }
    bioCount.textContent = `${bioContent.value.length}/400`;
  });
}

export function updateInfos() {
  const usernameInput = document.getElementById(
    "username-p1"
  ) as HTMLInputElement;
  const bioInput = document.getElementById(
    "biography-p1"
  ) as HTMLTextAreaElement;
  const updateButton = document.getElementById("update-infos");

  if (!usernameInput || !bioInput || !updateButton) return;

  const initialUsernameValue = usernameInput.value;
  const initialBioValue = bioInput.value;

  if (!updateButton) return;

  const checkChanges = () => {
    const changed =
      usernameInput.value !== initialUsernameValue ||
      bioInput.value !== initialBioValue;

    updateButton.classList.toggle("hidden", !changed);
  };
  usernameInput.addEventListener("input", checkChanges);
  bioInput.addEventListener("input", checkChanges);
}

export function showNotification(content:string, color: string) {
  const notif = document.getElementById("notif");
  if (!notif) return;

  notif.classList.add("bg-"+color);
  notif.textContent = content;
  notif.classList.remove("hidden");
  notif.classList.remove("animate-notification");
  void notif.offsetWidth;
  notif.classList.add("animate-notification");

  notif.addEventListener(
    "animationend",
    () => {
      notif.classList.add("hidden");
      notif.classList.remove("bg-"+color);
      notif.textContent = "";
    },
    { once: true }
  );
}
self["showNotification"] = showNotification;