// Load express so we can serve the public folder.
const express = require('express');
const app = express();

// Load socket.io so we can use the server version of JS websockets
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

// Identify the folder to server the public files from
app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);

// Load the namespaces for each new socket connection
io.on('connection', (socket) => {
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  socket.emit('nsList', nsData);
});

// loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {

  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    // username is sent with the socket header/handshake when the connection is established
    const username = nsSocket.handshake.query.username;

    // send namespace room info back to the new socket
    nsSocket.emit('nsRoomLoad', namespace.rooms);

    nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
      // find the room the user is currently, leave the room, adjust the head count.
      // the actual room is the second one found at index postion 1
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);

      // join the new room and update the user count
      nsSocket.join(roomToJoin);
      io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
        numberOfUsersCallback(clients.length);
      });

      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      });

      // Load the history for the room and update users in the room
      nsSocket.emit('historyCatchUp', nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);

    });

    nsSocket.on('newMessageToServer', (msg) => {
      // add date, username, and avatar to the message text
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: 'https://via.placeholder.com/30',
      };

      // Send the message to all sockets in the same room
      // The room name is in the second index of the object list
      const roomTitle = Object.keys(nsSocket.rooms)[1];

      // Locate the room object for current name
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      });

      // add the message to the history
      nsRoom.addMessage(fullMsg);

      // send the message to the sockets in the room
      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);

    });

  });
});

// Update number of users in all sockets connected
function updateUsersInRoom(namespace, roomToJoin) {
  io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
    io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length);
  });
}

