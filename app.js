const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const socketHandler = require('./server/socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Verificar que el directorio 'uploads' existe y crearlo si no
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Servir la carpeta 'uploads' como estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes); // Ruta para autenticación
app.use('/chat', chatRoutes); // Ruta para chat

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({ filePath: '/uploads/' + req.file.filename });
});

// Manejo de sockets
socketHandler(io);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});








