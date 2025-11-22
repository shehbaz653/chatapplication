(() => {


let username = localStorage.getItem('chat_username') || '';
if (!username) {
username = prompt('Pick a display name (e.g. Alice)') || ('User' + Math.floor(Math.random()*900+100));
localStorage.setItem('chat_username', username);
}


function appendMessage({user, text, time}, me) {
const li = document.createElement('li');
li.className = 'message' + (me ? ' me' : '');
const meta = document.createElement('div');
meta.className = 'meta';
const ts = new Date(time).toLocaleTimeString();
meta.textContent = user + ' • ' + ts;
const txt = document.createElement('div');
txt.className = 'text';
txt.textContent = text;
li.appendChild(meta);
li.appendChild(txt);
msgsEl.appendChild(li);
// scroll to bottom
msgsEl.parentElement.scrollTop = msgsEl.parentElement.scrollHeight;
}


function renderHistory(history) {
msgsEl.innerHTML = '';
history.forEach(m => appendMessage(m, m.user === username));
}


const ws = new WebSocket(WS_URL);


ws.addEventListener('open', () => {
statusEl.textContent = 'Connected';
// tell server who we are
ws.send(JSON.stringify({type:'join', user:username}));
});


ws.addEventListener('message', ev => {
try{
const data = JSON.parse(ev.data);
if (data.type === 'history') {
renderHistory(data.messages);
} else if (data.type === 'message') {
appendMessage(data.message, data.message.user === username);
}
}catch(e){
console.error('Invalid ws message', e);
}
});


ws.addEventListener('close', () => { statusEl.textContent = 'Disconnected'; });
ws.addEventListener('error', () => { statusEl.textContent = 'Error'; });


form.addEventListener('submit', e => {
e.preventDefault();
const text = input.value.trim();
if (!text || ws.readyState !== WebSocket.OPEN) return;
const payload = {type:'message', message:{user:username, text, time:Date.now()}};
ws.send(JSON.stringify(payload));
input.value = '';
});
})();