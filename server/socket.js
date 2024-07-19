const connection = require('./database');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('joinGroup', (grupo) => {
      socket.join(grupo);
      console.log(`Usuario se unió al grupo: ${grupo}`);

      // Cargar mensajes antiguos del grupo desde la base de datos
      const query = 'SELECT * FROM messages WHERE grupo = ? ORDER BY timestamp';
      connection.query(query, [grupo], (err, results) => {
        if (err) throw err;
        socket.emit('loadMessages', results);
      });

      // Si el grupo es 'Todos', cargar mensajes de todos los grupos
      if (grupo === 'Todos') {
        const allGroupsQuery = 'SELECT * FROM messages ORDER BY timestamp';
        connection.query(allGroupsQuery, (err, results) => {
          if (err) throw err;
          socket.emit('loadMessages', results);
        });
      }
    });

    socket.on('sendMessage', (data) => {
      const { user, grupo, message, file_path } = data;
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Guardar mensaje en la base de datos
      const query = 'INSERT INTO messages (user, grupo, message, file_path, timestamp) VALUES (?, ?, ?, ?, ?)';
      connection.query(query, [user, grupo, message, file_path, timestamp], (err) => {
        if (err) throw err;
        
        // Emitir el mensaje a todos los clientes en el grupo
        io.to(grupo).emit('receiveMessage', { user, grupo, message, file_path, timestamp });

        // Emitir el mensaje a todos los demás grupos si el grupo es 'Todos'
        if (grupo === 'Todos') {
          const groups = ['Administración', 'Ilo', 'Moquegua', 'Ichuña'];
          groups.forEach(g => {
            io.to(g).emit('receiveMessage', { user, grupo: 'Todos', message, file_path, timestamp });
          });
        } else {
          // Emitir el mensaje al grupo 'Todos'
          io.to('Todos').emit('receiveMessage', { user, grupo, message, file_path, timestamp });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });
};








  
  
  



