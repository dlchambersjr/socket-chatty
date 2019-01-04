function joinNs(endpoint) {

  // If the socket already exists, close it and remove the eventListener so we can have a fresh start
  if (nsSocket) {
    nsSocket.close();
    // remove event listener for socket that is being closed.
    document.querySelector('#user-input').removeEventListener('submit', formSubmission);
  }

  // make a new cliesnt connection with the endpoint
  nsSocket = io(`http://localhost:9000${endpoint}`);

  // load the rooms into the DOM
  nsSocket.on('nsRoomLoad', (nsRooms) => {

    // 1. Get the elements from the DOM
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = '';
    // 2. Add the lock or globe based on private or not
    nsRooms.forEach((room) => {
      let glyph;
      (room.privateRoom) ? glyph = 'lock' : glyph = 'globe';
      roomList.innerHTML += `<li class="room" ><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`;
    });

    // 3. add click listener to the room names
    let roomNodes = document.getElementsByClassName('room');
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener('click', (e) => {
        joinRoom(e.target.innerText);
      });
    });

    // Add user to first room when they first arrive
    const topRoom = document.querySelector('.room');
    const topRoomName = topRoom.innerText;
    joinRoom(topRoomName);

  });

  // when a message is received, build the HTML and render to the DOM
  nsSocket.on('messageToClients', (msg) => {
    const newMsg = buildHTML(msg);
    document.querySelector('#messages').innerHTML += newMsg;
  });

  // listen for new input on the message form
  document.querySelector('.message-form').addEventListener('submit', formSubmission);
}

//When user submits a msg, send it to the server
function formSubmission(event) {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  nsSocket.emit('newMessageToServer', { text: newMessage });
}

function buildHTML(msg) {
  // get a user friendly date string
  const convertedDate = new Date(msg.time).toLocaleString();

  // build the HTML to be inserted into the DOM.
  const newHTML = `
    <li>
      <div class="user-image">
        <img src="${msg.avatar}" />
      </div>
      <div class="user-message">
        <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
        <div class="message-text">${msg.text}</div>
      </div>
    </li>
    `;
  return newHTML;
}
