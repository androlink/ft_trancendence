// WEBSOCKET
let ws : WebSocket | null;

export function setupChat(){
	const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
	const chat = document.getElementById("chat-content");

    if (!chat || !textarea)
        return alert("chat broken");

    if (!ws || ws.readyState != WebSocket.OPEN)
        ws = new WebSocket("/api/chat");
    if (!ws)
        return ;

    ws.onclose = () =>{
        alert("connection close");
    }
    
    ws.addEventListener('message', (event) => {
        const receivemsg =  event.data;
        const scroll = (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 1);
        // true if at the end of the chat
        const para = document.createElement("p");
        const node = document.createTextNode(receivemsg);
        para.appendChild(node);
        chat.appendChild(para);
        if (scroll) {
            chat.scrollTop = chat.scrollHeight;
        };
    });
    
	textarea.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
			sendMessage();
		}
	});
    (window as any).sendMessage = sendMessage;
}

function waitForSocketConnection(socket, send: Function){
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
function sendOrQueue(message: string){
    if (ws.readyState === WebSocket.OPEN)
        ws.send(message);
    else
        waitForSocketConnection(ws, () => {ws.send(message);})
}

function sendMessage() {
	const textarea = document.getElementById("chat-input") as HTMLTextAreaElement | null;
	if (!textarea || !textarea.value) {
		return;
	}
    const message_content = textarea.value;
    textarea.value = "";
    
    sendOrQueue(message_content);
}