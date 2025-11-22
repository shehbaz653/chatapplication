// Simple Node.js + ws server that also serves the static files
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// serve static client files from the same folder
app.use(express.static(path.join(__dirname, '/')));


// in-memory message history (circular buffer)
const MAX_HISTORY = 200;
const history = [];


function addHistory(msg){
history.push(msg);
if (history.length > MAX_HISTORY) history.shift();
}


function broadcast(obj){
const raw = JSON.stringify(obj);
wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(raw); });
}


wss.on('connection', (ws, req) => {
// when a client connects, send history
ws.send(JSON.stringify({type:'history', messages: history}));


ws.on('message', message => {
let data;
try { data = JSON.parse(message); } catch(e){ return; }


if (data.type === 'join'){
// could track user on ws if needed
ws._user = data.user;
return;
}


if (data.type === 'message' && data.message){
const m = data.message;
// ensure timestamp
if (!m.time) m.time = Date.now();
addHistory(m);
broadcast({type:'message', message: m});
}
});
});


const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));