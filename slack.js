const express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(9000);
const io = socketio(expressServer);


io.on('connection', (socket) => {
  console.log(socket.handshake);
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  // console.log(nsData);

  socket.emit('nsList', nsData);

});

namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    const username = nsSocket.handshake.query.username;
    // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`);
    // send namespace room info back to the socket
    nsSocket.emit('nsRoomLoad', namespace.rooms);
    nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
      // handle history later
      console.log(nsSocket.rooms);
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      nsSocket.join(roomToJoin);

      io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        // console.log(clients.length);
        numberOfUsersCallback(clients.length);
      });

      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      });

      nsSocket.emit('historyCatchUp', nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);

    });

    nsSocket.on('newMessageToServer', (msg) => {

      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: 'https://via.placeholder.com/30',
      };

      // console.log(fullMsg);
      // Send the message to all sockets in the same room
      // console.log(nsSocket.rooms);
      // The user is in the second room of the object list
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // console.log(roomTitle);

      // Locate the room object for current name
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      });

      // console.log(nsRoom);
      nsRoom.addMessage(fullMsg);

      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);

    });



  });
});

// Update number of users in all sockets connected

function updateUsersInRoom(namespace, roomToJoin) {
  io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
    // console.log(`There are ${clients.length} in this room`);
    io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length);
  });
}

