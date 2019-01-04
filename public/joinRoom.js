function joinRoom(roomName) {
  // send the room name to the server
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // update the room member total now that we have joined.
    document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;

  });

  // update history when user enters a room
  nsSocket.on('historyCatchUp', (history) => {
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = '';

    // Get HTML for each message in the history
    history.forEach((msg) => {
      const newMsg = buildHTML(msg);
      messagesUl.innerHTML += newMsg;
    });

    // set the scroll bars to be at the bottom of the messages
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });

  //update the DOM with the new user count in the room
  nsSocket.on('updateMembers', (numMembers) => {
    document.querySelector('.curr-room-num-users').innerHTML = `${numMembers} <span class="glyphicon 
    glyphicon-user"></span>`;
    document.querySelector('.curr-room-text').innerText = `${roomName}`;
  });

  // Search box
  let searchBox = document.querySelector('#search-box');

  // get all the messages in the room that match the search box text
  searchBox.addEventListener('input', (e) => {
    let messages = Array.from(document.getElementsByClassName('message-text'));
    messages.forEach((msg) => {
      let msgToLowerCase = msg.innerText.toLowerCase();
      let searchValue = e.target.value.toLowerCase();

      if (msgToLowerCase.indexOf(searchValue) === -1) {
        msg.style.display = 'none'; // hide if msg does not contain search text
      } else {
        msg.style.display = 'block'; // show if msg does contain search text
      }
    });
  });



}