const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', socket => {
  socket.on('join-room', roomId => {
    socket.join(roomId);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code);
  });

  socket.on('disconnect', () => {
    // Handle user disconnect logic (optional)
  });
});

app.get('/', (req, res) => {
  res.send('Server Running');
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
