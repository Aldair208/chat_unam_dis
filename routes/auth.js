const express = require('express');
const path = require('path');
const router = express.Router();
const connection = require('../server/database');

// Ruta para login
router.post('/login', (req, res) => {
  const { dni, password } = req.body;
  const query = 'SELECT * FROM users WHERE dni = ? AND password = ?';
  connection.query(query, [dni, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      // Usuario encontrado, redirigir a la página de chat con la información del usuario
      const user = results[0];
      res.redirect(`/chat.html?nombre=${user.nombre}&apellido=${user.apellido}&cargo=${user.cargo}`);
    } else {
      // Usuario no encontrado, enviar mensaje de error
      res.send('Usuario o contraseña incorrectos');
    }
  });
});

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html')); // Asegúrate de que la ruta al archivo HTML es correcta
});

// Ruta para registro
router.post('/register', (req, res) => {
  let { nombre, apellido, dni, cargo, ciudad, seguridad, 'detalle-seguridad': detalleSeguridad, password } = req.body;

  // Si el cargo es "Administración", agregar la ciudad seleccionada o especificada al cargo
  if (cargo === 'Administración') {
    if (ciudad === 'Otros') {
      ciudad = req.body['otra-ciudad'];
    }
    cargo = `${cargo} - ${ciudad}`;
  }

  // Si el cargo es "Personal de Seguridad", agregar el área seleccionada o especificada al cargo
  if (cargo === 'Personal de Seguridad') {
    cargo = `${cargo} - ${seguridad} - ${detalleSeguridad}`;
  }

  const checkUserQuery = 'SELECT * FROM users WHERE dni = ?';
  connection.query(checkUserQuery, [dni], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      // Usuario ya existe
      res.send('El usuario con este DNI ya existe.');
    } else {
      // Insertar nuevo usuario
      const insertUserQuery = 'INSERT INTO users (nombre, apellido, dni, cargo, password) VALUES (?, ?, ?, ?, ?)';
      connection.query(insertUserQuery, [nombre, apellido, dni, cargo, password], (err) => {
        if (err) throw err;
        res.redirect('/'); // Redirigir al login después de registrar el usuario
      });
    }
  });
});

module.exports = router;


