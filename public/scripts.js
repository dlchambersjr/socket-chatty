const username = prompt('What is your username');

// const socket = io('http://localhost:9000');
const socket = io('http://localhost:9000', {
  query: {
    username: username,
  }
});

let nsSocket = '';

// Listen for the list of namespaces
socket.on('nsList', (nsData) => {
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
  });

  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      const nsEndpoint = elem.getAttribute('ns');
      joinNs(nsEndpoint);
    });
  });

  joinNs('/wiki');

});
