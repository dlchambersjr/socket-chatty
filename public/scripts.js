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
  console.log('The list of namespaces has arrived');
  // console.log(nsData);
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}"/></div>`;
  });

  // Add a click listener
  console.log(document.getElementsByClassName('namespace'));
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    // console.log(elem)
    elem.addEventListener('click', (e) => {
      // console.log(e.target);
      const nsEndpoint = elem.getAttribute('ns');
      // console.log(nsEndpoint, 'I should go to now');
      joinNs(nsEndpoint);
    });
  });

  joinNs('/wiki');

});
