

import { goToURL, keyExist, resetReconnectTimer } from "./utils.js";
import { htmlSnippets, setLanguage, selectLanguage, findLanguage } from "./templates.js";
import { main } from "./app.js";

/**
 * set all the events that the page need to work properly
 */
export function setEvents(): void {
  let elem: any;
  const events = {
    "chat-input": setEnterEventChat,
    "user-search": setEnterEventUsername,
    "pfp-form": setSubmitEventPfp,
    "login-form": setSubmitEventLogin,
    "register-form": setSubmitEventRegister,
    "profile-form": setSubmitEventProfile,
    "pfp-input": setChangeEventPfpInput,
    "go-to-profile": setClickEventProfile,
    "change-password-form": setSubmitEventPassword,
    "delete-account-form": setSubmitEventDelete,
    "language-selector": setChangeEventLanguageSelector,
  }
  for (const id in events) {
    const elem = document.getElementById(id);
    if (elem && !elem.hasAttribute("data-custom")) {
      events[id](elem);
      elem.toggleAttribute("data-custom", true);
    }
  }
}


/**
 * it will try to write the error on the last child of the element if named "error-handler.
 * Else, alert()
 * @param form the form element
 * @param message the error that will be shown
 */
function displayErrorOrAlert(form: HTMLFormElement, message: string): void {
  try {
    const child = form.lastElementChild;
    if (child && child.getAttribute("name") === "error-handler") {
      child.textContent = message;
      return;
    }
    const template = document.createElement('template');
    template.innerHTML = htmlSnippets["ErrorMessageHandler"];
    const handler = template.content.firstElementChild as HTMLParagraphElement;
    if (handler === null) {
      alert(message);
      return;
    }
    handler.innerText = message;
    form.appendChild(handler);
  } catch (error) {
    alert(`${message}\nAlso: ${error}`);
  }
}

/**
 * used by the login form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventPfp(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const response = await fetch('/pfp', {
        method: 'PUT',
        body: formData,
      });

      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      main(true);
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

function setSubmitEventLogin(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
        try {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const response = await fetch('/login', {
        method: 'POST',
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          username: username, 
          password: password,
        }),
      });

      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the Password change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventRegister(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
        try {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      if (password !== formData.get("password-confirm") as string) {
        displayErrorOrAlert(form, findLanguage("passwords don't match"));
        return ;
      }
      const response = await fetch('/register', {
        method: 'POST',
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });
      
      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the Profile form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventProfile(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const response = await fetch('/update', {
        method: 'PUT',
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          username: formData.get('username') as string,
          biography: formData.get('biography') as string,
        }),
      });

      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      goToURL(`profile/${formData.get('username') as string}`);
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}


/**
 * used by the Passwrd change form, the default event can't be used in SPA (redirect)
 * @param form the said form element
 */
function setSubmitEventPassword(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
        try {
      const password = formData.get("password") as string;
      if (password !== formData.get("password-confirm") as string) {
        displayErrorOrAlert(form, findLanguage("passwords don't match"));
        return ;
      }

      const response = await fetch('/password', {
        method: 'PUT',
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          password: password, 
        }),
      });

      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      const elem = document.getElementById("username");
      if (elem && elem.hasAttribute("value"))
        goToURL(`profile/${elem.getAttribute("value")}`);
      else
        goToURL( );
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

function setSubmitEventDelete(form: HTMLFormElement): void {
  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const response = await fetch('/delete', {
        method: 'DELETE',
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          username: formData.get("username") as string, 
        }),
      });

      resetReconnectTimer(response.headers.get('x-authenticated'));
      const result: {success?: boolean, message?: string} = await response.json();
      if (!result.success) {
        displayErrorOrAlert(form, keyExist(result, "message") ? selectLanguage(result.message) : 
        `${findLanguage("server answered")} ${response.status} ${response.statusText}`);
        return ;
      }
      main();
    } catch (error) {
      displayErrorOrAlert(form, String(error));
    }
  });
}

/**
 * used by the button that goes to the public profile from /profile
 * @param textElem the HTMLElement that's gonna get the event
 */
function setClickEventProfile(text: HTMLElement): void {
  const usernameElem = document.getElementById("username");
  if (!usernameElem || !usernameElem.hasAttribute("value"))
    return ;
  const username: string = usernameElem.getAttribute("value");
  text.addEventListener("click", (event: PointerEvent) => 
    goToURL(`profile/${username}`)
  );
}

/**
 * used by the chat input, send message on enter
 * @param textarea the said chat input element
 */
function setEnterEventChat(textarea: HTMLTextAreaElement): void {
  textarea.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (textarea && textarea.value) {
        sendMessage(textarea.value);
        textarea.value = "";
      }
    }
  });
}


/**
 * to add a new message to the chat.
 * Made it better than just taking one single string for debugging purpose (it sucks keep using console.log)
 * 
 * sent to the console, so no translation done
 *
 * NOT DEFINITIVE,
 * NEED TO ADD SOCKETS,
 * ONLY THERE (for now) TO TEST THE APPEARANCE
 *
 * @param ...args anything that will be send to chat, separated by ", "
 * @returns true if the user has "seen" the message.
 * For instance to make a notif system.
 */
export function sendMessage(...args: any[]): boolean {
  let message = args.join(", ");
  if (!message){
    console.error(`message not sent BECAUSE NOTHING TO SEND`);
    return false
  }
  const chat = document.getElementById("chat-content");
  if (!chat) {
    console.error(`message '${message}' not sent to the chat because the chat is not found`);
    return false;
  }
  let scroll = (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1);
  // true if at the end of the chat
  const para = document.createElement('p');
  const node = document.createTextNode(message);
  para.appendChild(node);
  chat.appendChild(para);
  if (scroll) {
    chat.scrollTop = chat.scrollHeight;
  }
  return scroll;
}
self["sendMessage"] = sendMessage;

/**
 * Used by the username input at the top of the UI.
 * Preferably NOT DEFINITIVE (annoying to use)
 * @param textarea the said username input
 */
function setEnterEventUsername(textarea: HTMLTextAreaElement): void {
  textarea.toggleAttribute("data-custom", true);
  textarea.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === 'Enter' && textarea.value) {
      event.preventDefault();
      goToURL(`profile/${textarea.value}`, true);
      textarea.value = "";
    }
  });
}

function setChangeEventLanguageSelector(select: HTMLSelectElement): void {
  let lang = localStorage.getItem('language');
  if (lang === null) lang = 'en';
  select.querySelector(`[value="${lang}"]`)?.toggleAttribute("selected", true);
  select.addEventListener("change", (e) => {
    localStorage.setItem("language", select.value);
    setLanguage();
    main(true, false);
  });
}

function setChangeEventPfpInput(input: HTMLInputElement) {
  input.addEventListener("change", (e) => {
    const file = input.files[0];
    if (!file) return;
    
    // Check MIME type
    if (!file.type.startsWith('image/')) {
      input.value = '';
      document.getElementById("pfp-preview-div").toggleAttribute('hidden', true);
      const form = document.getElementById("pfp-form") as HTMLFormElement;
      if (form) displayErrorOrAlert(form, findLanguage("need image"));
      return;
    }
    const img = window.URL.createObjectURL(input.files[0]);
    const preview = document.getElementById("pfp-preview") as HTMLImageElement;
    if (preview && img) preview.src = img;
    document.getElementById("pfp-preview-div")?.removeAttribute('hidden')
  });
}

/**
 * Used at the start of the app-launching, to keyboard shortcut
 * - control K will select (if present) the user-search
 * - control enter will select (if present) the chat-input
 * - control P will search for /profile or /profile/username instead of printing the page
 * ...
 */
export function setCtrlEventUsername(): void {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      const elem = document.getElementById("user-search") as HTMLTextAreaElement;
      if (elem) {
        e.preventDefault();
        elem.select();
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const elem = document.getElementById("chat-input") as HTMLTextAreaElement;
      if (elem) { // might have to add if not hidden later
        e.preventDefault();
        elem.select();
      }
    }

    if ((e.ctrlKey || e.metaKey) && ! e.shiftKey && e.key === 'p') {
      e.preventDefault();
      const elem = document.getElementById("username");
      if (elem && elem.hasAttribute("value")) {
        goToURL(`profile/${elem.getAttribute("value")}`);
        return ;
      }
      goToURL('profile');
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      if (self["isConnected"]) {
        e.preventDefault();
        fetch("/logout", {method: 'POST'}).then(
          res => {
            resetReconnectTimer(res.headers.get("x-authenticated")); 
            if (document.activeElement.id !== "user-search") main();
            else sendMessage("You found a debug option, won't force a reload if user-search is selected");
          }
        ).catch(err => alert('Caught: ' + err));
      }
    }
  })

  const app = document.getElementById("app");
  const template = document.createElement('template');
  template.innerHTML = htmlSnippets["PopUp"];
  const help = template.content.firstElementChild;
  let isPressed = null;
  if (app && help) {
    document.addEventListener("keydown", (e) => {
      e.stopPropagation();
      // document active is set to body to not activate while using chat
      if (e.key === '?' && !isPressed && document.activeElement === document.body) {
        isPressed = e.code;
        app.appendChild(help);
        
      }
    });
    document.addEventListener("blur", (e) => {
      // it's for removing when leaving the page (changin website || changing app)
      if (isPressed) {
        isPressed = null;
        if (app.contains(help)) {
          app.removeChild(help);
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.code === isPressed) {
        isPressed = null;
        if (app.contains(help)) {
          app.removeChild(help);
        }
      }
    });
  }
}
