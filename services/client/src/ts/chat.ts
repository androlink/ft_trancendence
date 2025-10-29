import { sendMessage } from "./events.js";

// WEBSOCKET
let ws: WebSocket | null;

interface WSmessage {
    type: string,
    id: string,
    content: string
};

export function InitConnectionChat() {
    const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
    const chat = document.getElementById("chat-content");

    if (!chat || !textarea)
        return alert("chat broken");

    if (!ws || ws.readyState != WebSocket.OPEN)
        ws = new WebSocket("/api/chat");
    if (!ws)
        return;

    ws.onclose = () => {
        alert("connection close");
    }

    ws.addEventListener('message', (event) => {
        const receivemsg: WSmessage = JSON.parse(event.toString());
        sendMessage(event.data);
    });

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

    textarea.value = "";
    const msg: WSmessage =  {
        id: "1",
        type: "message",
        content: textarea.value
    };
    sendOrQueue(JSON.stringify(msg));
}