import { goToURL } from "./utils.js";

// WEBSOCKET
let ws: WebSocket | null;

enum TypeMessage {
  message = "message",
  yourMessage = "yourMessage",
  directMessage = "directMessage",
  yourDirectMessage = "yourDirectMessage",
  readyForDirectMessage = "readyForDirectMessage",
  serverMessage = "serverMessage",
  connection = "connection",
  ping = "ping",
  pong = "pong",
}

/**
 * Interface Message
 * @param type Type of message send (message, ping, etc..).
 * @param user User who send the message.
 * @param target where the message is send (everyone by default) [optional]
 * @param content Content of the message if is necessary [optional]
 * @param msgId Id of the message (for direct message)
 */
interface WSmessage {
  type: TypeMessage;
  user: string;
  target?: string;
  content?: string;
  msgId: string;
}
let lastPong: number;

function GenerateRandomId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

let reconnectTimeout = 1000;
/**
 * try to call WSconnect to re set a connection websocket
 */
function retryConnection(): void {
  console.log("Retry chat connection");
  setTimeout(WSconnect, reconnectTimeout);
  reconnectTimeout = Math.min(reconnectTimeout * 2, 10000);
}

/**
 * Create New connection Websocket
 * Setup message eventListener
 * call retryConnection if the connection close
 */
function WSconnect(): void {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  ws = new WebSocket("/api/chat");

  ws.onopen = sendStatusMessage;

  ws.onclose = retryConnection;

  ws.onerror = () => ws.close();

  //receive msg from back and show on chat
  ws.addEventListener("message", (event) => {
    try {
      const receivemsg: WSmessage = JSON.parse(event.data);
      console.log("[incoming message]:", receivemsg);
      // check type
      if (receivemsg.type === TypeMessage.pong) {
        lastPong = Date.now();
      } else if (receivemsg.type === TypeMessage.readyForDirectMessage) {
        sendOrQueue(
          JSON.stringify({
            user: localStorage.getItem("token"),
            type: TypeMessage.readyForDirectMessage,
            target: receivemsg.user,
            msgId: receivemsg.msgId,
          })
        );
      } else {
        //construct message to show on the chat
        showMessageToChat(receivemsg);
      }
    } catch (err) {
      console.error("error : " + err);
    }
  });
}

/**
 * Initialise chat and create a connection Websocket
 */
export function InitConnectionChat(): void {
  // get the chat box
  const chat = document.getElementById("chat-content");
  // get the chat input
  const textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
  if (!chat || !textarea) return;

  WSconnect();

  //call sendChatMessage with Enter key
  (window as any).sendChatMessage = sendChatMessage;

  //ping pong
  setInterval(() => {
    const ping: WSmessage = {
      user: localStorage.getItem("token"),
      type: TypeMessage.ping,
      msgId: GenerateRandomId(),
    };
    sendOrQueue(JSON.stringify(ping));
  }, 15000);
  setInterval(() => {
    if (Date.now() - lastPong > 30000) {
      console.log("chat connection lost");
      WSconnect();
    }
  }, 5000);
}

/**
 * Show receive message to the chat
 * @param message receive message to show to the chat
 *
 */
function showMessageToChat(message: WSmessage): boolean {
  const chat = document.getElementById("chat-content");
  if (!chat) {
    console.error(
      `message '${message}' not sent to the chat because the chat is not found`
    );
    return false;
  }
  // true if at the end of the chat
  let scroll = chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1;

  const para = document.createElement("p");
  const userLink = document.createElement("span");
  const node = document.createTextNode(message.content);

  switch (message.type) {
    case TypeMessage.message:
      // setup username
      userLink.onclick = () => {
        goToURL(`profile/${message.user}`);
      };
      userLink.textContent = `${message.user}:`;
      userLink.className =
        "text-indigo-500 hover:font-bold p-2 rounded-md cursor-pointer ";
      para.appendChild(userLink);
      para.appendChild(node);

      break;
    case TypeMessage.yourMessage:
      // setup username
      userLink.onclick = () => {
        goToURL(`profile/${message.user}`);
      };
      userLink.textContent = `${message.user}:`;
      userLink.className =
        "text-blue-600 hover:font-bold p-2 rounded-md cursor-pointer ";
      para.appendChild(userLink);
      para.appendChild(node);

      break;
    case TypeMessage.directMessage:
      // setup username
      userLink.onclick = () => {
        goToURL(`profile/${message.user}`);
      };
      userLink.textContent = `${message.user}:`;
      userLink.className =
        "text-pink-400 hover:font-bold p-2 rounded-md cursor-pointer ";
      para.appendChild(userLink);
      para.appendChild(node);

      break;
    case TypeMessage.yourDirectMessage:
      // setup username
      userLink.onclick = () => {
        goToURL(`profile/${message.user}`);
      };
      userLink.textContent = `[Me] ${message.user}:`;
      userLink.className =
        "text-pink-400 hover:font-bold p-2 rounded-md cursor-pointer ";
      para.appendChild(userLink);
      para.appendChild(node);

      break;
    case TypeMessage.serverMessage:
      para.className = "text-red-500 font-bold text-center";
      if (message.content === "You are not connected") goToURL("/profile");
      para.appendChild(node);

      break;
  }

  chat.appendChild(para);

  if (chat.childElementCount > 1000) {
    // we have to remove by an even (% 2) amount due to CSS even and odd colors
    chat.firstElementChild?.remove();
    chat.firstElementChild?.remove();
  }
  if (scroll) {
    chat.scrollTop = chat.scrollHeight;
  }
  return scroll;
}

/**
 * wait if the websocket is on
 * @param socket Websocket to check
 * @param send function to send the message on backend
 */
function waitForSocketConnection(socket: WebSocket, send: Function) {
  setTimeout(function () {
    if (socket.readyState === 1) {
      console.log("Connection is made");
      send();
    } else {
      waitForSocketConnection(socket, send);
    }
  }, 5);
}

/**
 * send the message or call waitForSocketConnection
 * if the connection websocket isn't on
 * @param message message to send
 */
function sendOrQueue(message: string) {
  if (ws.readyState === WebSocket.OPEN) ws.send(message);
  else {
    console.log("connection not ready");
    waitForSocketConnection(ws, () => {
      ws.send(message);
    });
  }
}

/**
 * Send message to the chat
 * - can send Direct messgage with /msg commands
 * @example
 * /msg [username1,username2,...] Hello World !
 */
export function sendChatMessage() {
  const textarea = document.getElementById("chat-input") as HTMLTextAreaElement;
  if (!textarea || !textarea.value) return;
  if (textarea.value.length > 280) {
    const err: WSmessage = {
      user: null,
      type: TypeMessage.serverMessage,
      content: "message size is fixed at 280 characters",
      msgId: GenerateRandomId(),
    };
    showMessageToChat(err);
    return;
  }
  // check commands
  if (textarea.value.startsWith("/")) {
    let command = textarea.value.split(" ")[0];
    command = command.slice(1);
    const args = textarea.value.slice(1).trim().split(" ");

    // Direct Message command
    if (command === "msg") {
      const targets = args[1].split(",");
      const msg: WSmessage = {
        user: localStorage.getItem("token"),
        type: TypeMessage.message,
        content: args.slice(2).join(" "),
        msgId: GenerateRandomId(),
      };
      if (!msg.content.length) return;

      textarea.value = "";
      for (let client of targets) {
        msg.target = client;
        sendOrQueue(JSON.stringify(msg));
      }
    }
    return;
  }
  const msg: WSmessage = {
    user: localStorage.getItem("token"),
    type: TypeMessage.message,
    content: textarea.value,
    msgId: GenerateRandomId(),
  };
  textarea.value = "";
  sendOrQueue(JSON.stringify(msg));
}

/**
 * Send a Status of the actuel Websocket connection
 * - when is `register/login`
 * - when is `logout`
 * - when their `update` there infos
 * - when a `new Websocket` connection is made
 */
export function sendStatusMessage() {
  const msg: WSmessage = {
    user: localStorage.getItem("token"),
    type: TypeMessage.connection,
    msgId: GenerateRandomId(),
  };
  sendOrQueue(JSON.stringify(msg));
}
