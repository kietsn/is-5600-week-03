const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Responds with plain text
 */
function respondText(req, res) {
  res.type('text/plain');
  res.send('hi');
}

/**
 * Responds with JSON
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Responds with the input string in various formats
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * Serves up the chat.html file
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, 'chat.html'));
}

/**
 * Receives a chat message and broadcasts it
 */
function respondChat(req, res) {
  const { message = '' } = req.query;

  if (message.trim()) {
    chatEmitter.emit('message', message);
  }

  res.status(204).end();
}

/**
 * Sends server-sent events to connected clients
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  });

  res.write('\n');

  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  req.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

/**
 * Responds with a 404 not found
 */
function respondNotFound(req, res) {
  res.status(404).type('text/plain').send('Not Found');
}

// routes
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// optional plain text route so the function is still used
app.get('/text', respondText);

// serve chat page
app.get('/chat.html', chatApp);
app.get('/', chatApp);

// 404
app.use(respondNotFound);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});