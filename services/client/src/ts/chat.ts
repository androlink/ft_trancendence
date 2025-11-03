import { sendMessage } from "./events.js";


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
    ws = new WebSocket("/api/chat");
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
    ws = null;
  }

  //receive msg from back and show on chat
  ws.addEventListener('message', (event) => {
    try {
      const receivemsg: WSmessage = JSON.parse(event.data);
      // check type
      if (receivemsg.type === "message")
      {
        //check Id to set username
        const username = receivemsg.id;
        //construct message to show on the chat
        const msgformat = `${username}: ${receivemsg.content}`;
        sendMessage(msgformat);
      }
      if (receivemsg.type === "pong"){
        console.log("pong");
        lastPong = Date.now();
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
  const msg: WSmessage =  {
    id: localStorage.getItem("token"),
    type: "message",
    content: textarea.value
  };
  textarea.value = "";
  sendOrQueue(JSON.stringify(msg));
}

export function sendStatusMessage()
{
  const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
  if (!textarea || !textarea.value) {
    return;
  }
  const msg: WSmessage =  {
    id: localStorage.getItem("token"),
    type: "connection",
    content: textarea.value
  };
  textarea.value = "";
  sendOrQueue(JSON.stringify(msg));
}