const socket = io();
let currentGroup = '';
let messageCount = 0; // Contador para alternar colores

document.getElementById('send-button').addEventListener('click', () => {
  const message = document.getElementById('chat-input').value;
  const user = document.getElementById('welcome-message').textContent.split(' - ')[0];
  if (message && currentGroup) {
    socket.emit('sendMessage', { user, grupo: currentGroup, message });
    document.getElementById('chat-input').value = '';
  }
});

document.getElementById('send-file-button').addEventListener('click', () => {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  const user = document.getElementById('welcome-message').textContent.split(' - ')[0];

  if (file && currentGroup) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      const message = `<a href="${data.filePath}" target="_blank">Ver archivo</a>`;
      socket.emit('sendMessage', { user, grupo: currentGroup, message, file_path: data.filePath });
      fileInput.value = ''; // Limpiar el input de archivo
    })
    .catch(error => {
      console.error('Error al subir el archivo:', error);
    });
  }
});

function joinGroup(grupo) {
  currentGroup = grupo;
  document.getElementById('chat-messages').innerHTML = ''; // Limpiar mensajes del grupo anterior
  messageCount = 0; // Reiniciar el contador de mensajes
  socket.emit('joinGroup', grupo);

  // Actualizar la clase activa del botón del grupo
  const buttons = document.querySelectorAll('#group-buttons button');
  buttons.forEach(button => {
    if (button.id === grupo) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function sendPresetMessage(message) {
  const user = document.getElementById('welcome-message').textContent.split(' - ')[0];
  if (currentGroup) {
    socket.emit('sendMessage', { user, grupo: currentGroup, message });
  }
}

socket.on('receiveMessage', (data) => {
  const { user, grupo, message, file_path, timestamp } = data;
  if (grupo === currentGroup || currentGroup === 'Todos') {
    displayMessage(data);
  }
});

socket.on('loadMessages', (messages) => {
  document.getElementById('chat-messages').innerHTML = ''; // Limpiar mensajes existentes
  messages.forEach((data) => {
    displayMessage(data);
  });
  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight; // Desplazar hacia abajo automáticamente
});

function displayMessage({ user, grupo, message, file_path, timestamp }) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(messageCount % 2 === 0 ? 'alternate1' : 'alternate2'); // Alternar clases
  messageElement.innerHTML = `
    <div class="user-info">
      <div class="name">${user}</div>
    </div>
    <div class="message-content">${message}</div>
    <div class="timestamp">${new Date(timestamp).toLocaleString()}</div>
    ${currentGroup === 'Todos' ? `<div class="group-info">(de ${grupo})</div>` : ''}
  `;
  document.getElementById('chat-messages').appendChild(messageElement);
  document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight; // Desplazar hacia abajo automáticamente
  messageCount++; // Incrementar contador de mensajes
}

// Inicializar con el grupo 'Todos' por defecto
joinGroup('Todos');















