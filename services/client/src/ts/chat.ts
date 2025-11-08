import { sendMessage } from "./events.js";
import { goToURL } from "./utils.js";


// WEBSOCKET
let ws: WebSocket | null;


/**
 * Interface Message
 * @param type Type of message send (message, ping, etc..).
 * @param id Id of who send the message.
 * @param target where the message is send (everyone by default) [optional]
 * @param content Content of the message if is necessary [optional]
 */
interface WSmessage {
  type: string,
  id: string,
  target?: string | null,
  content?: string | null
};
/**
 * Create New connection Websocket
 */
function WSconnect()
{
  if (!ws || ws.readyState != WebSocket.OPEN)
  {
    ws = new WebSocket("/api/chat");
    sendStatusMessage();
  }
  
}
// setup connection chat
export function InitConnectionChat() {
  const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
  const chat = document.getElementById("chat-content");
  let lastPong;

  if (!chat || !textarea)
    return alert("chat broken");

  WSconnect();
  if (!ws)
    return;

  ws.onclose = () => {
    alert("connection close");
    WSconnect();
  }

  //receive msg from back and show on chat
  ws.addEventListener('message', (event) => {
    try {
      const receivemsg: WSmessage = JSON.parse(event.data);
      console.log("[incoming message]:", receivemsg);
      // check type
      if (receivemsg.type === "message" || receivemsg.type === "direct_message")
      {
        //check Id to set username
        const username = receivemsg.id;
        //construct message to show on the chat
        const msgformat = `${username}: ${receivemsg.content}`;
        showMessageToChat(receivemsg);
      }
      if (receivemsg.type === "pong"){
        console.log("pong");
        lastPong = Date.now();
      }
      if (receivemsg.type === "readyForDirectMessage"){
        sendOrQueue(JSON.stringify({id: localStorage.getItem('token'), type: "direct_message", target: receivemsg.id}))
      }
    } catch (err) {
      alert("error : "+ err);
    }
  });

  //ping pong
  setInterval(() => {

    const ping: WSmessage = {id: localStorage.getItem("token"), type: "ping"}
    ws.send(JSON.stringify(ping));
  }, 15000);
  setInterval(() => {
    if (Date.now() - lastPong > 30000){
      console.log("chat connection lost");
      WSconnect();
    }
  }, 5000);

  textarea.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
  (window as any).sendChatMessage = sendChatMessage;
}



function showMessageToChat(message: WSmessage): boolean {
  
  const chat = document.getElementById("chat-content");
  if (!chat) {
    console.error(`message '${message}' not sent to the chat because the chat is not found`);
    return false;
  }
  
  // true if at the end of the chat
  let scroll = (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1);
  const para = document.createElement('p');
  
  if (message.type == "direct_message"){
    // setup username
    para.className = 'text-pink-400';
    const userLink = document.createElement('span');
    userLink.onclick = () => {goToURL(`profile/${message.id}`)};
    userLink.textContent = `${message.id}:`;
    userLink.className = 'text-blue-600 hover:font-bold p-2 rounded-md cursor-pointer ';
    // setup text
    const messageText = document.createElement('span');
    messageText.textContent = message.content;
    messageText.className = 'italic';
    para.appendChild(userLink);
    para.appendChild(messageText);
  }
  else if (message.id === "server"){
    para.className = 'text-red-500 font-bold text-center';
    const node = document.createTextNode(message.content);
    para.appendChild(node);
  }
  else {
    // setup username
    const userLink = document.createElement('span');
    userLink.onclick = () => {goToURL(`profile/${message.id}`)};
    userLink.textContent = `${message.id}:`;
    userLink.className = 'text-indigo-500 hover:font-bold p-2 rounded-md cursor-pointer ';
    // setup text
    const node = document.createTextNode(message.content);
    para.appendChild(userLink);
    para.appendChild(node);
  }

  chat.appendChild(para);
  if (scroll) {
    chat.scrollTop = chat.scrollHeight;
  }
  return scroll;
}



function waitForSocketConnection(socket, send: Function) {
  setTimeout(
    function () {
      if (socket.readyState === 1) {
        console.log("Connection is made");
        send();
      } else {
        waitForSocketConnection(socket, send);
      }
    }, 5);
}

function sendOrQueue(message: string) {
  if (ws.readyState === WebSocket.OPEN)
    ws.send(message);
  else
    waitForSocketConnection(ws, () => { ws.send(message); })
}

function sendChatMessage() {
  const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
  if (!textarea || !textarea.value) {
    return;
  }

  if (textarea.value.startsWith('/'))
  {
    let command = textarea.value.split(" ")[0];
    command = command.slice(1);
    const args = textarea.value.slice(1).trim().split(' ');

    if (command === 'msg')
    {
      const targets = args[1].split(',');
      const msg: WSmessage =  {
        id: localStorage.getItem("token"),
        type: "message",
        content: args.slice(2).join(' ')
      };
      textarea.value = "";
      for (let client of targets)
      {
        msg.target = client;
        sendOrQueue(JSON.stringify(msg));
      }
    }
  }
  else
  {
    const msg: WSmessage =  {
      id: localStorage.getItem("token"),
      type: "message",
      content: textarea.value
    };
    textarea.value = "";
    sendOrQueue(JSON.stringify(msg));
  }
}

export function sendStatusMessage()
{
  const msg: WSmessage =  {
    id: localStorage.getItem("token"),
    type: "connection",
  };
  console.log("Websocket status changed...")
  sendOrQueue(JSON.stringify(msg));
}