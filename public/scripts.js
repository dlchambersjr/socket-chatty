// Get the username and connect to the socket
const username = prompt('What is your username');
const socket = io('http://localhost:9000', {
  query: {
    username: username,
  },
});

let nsSocket = '';

// Listen for the list of namespaces to be provided via nsList
socket.on('nsList', (nsData) => {

  // get the namespace element in the DOM and render the namespaces
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
  });

  // Put the DOM elements into an array so a click eventlistener can be added to each.
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      const nsEndpoint = elem.getAttribute('ns');

      // Join the targeted namespace when it is clicked.
      joinNs(nsEndpoint);

    });
  });

  // Join the /wiki namespace as the default
  joinNs('/wiki');

});
