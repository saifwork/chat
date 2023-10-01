module.exports = function (io, socket) {
    socket.on('chat message', (message) => {
      io.emit('chat message', message);
      console.log('Message emitted');
      console.log(message);
    });
  };
  