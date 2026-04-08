const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Configuración
app.set('port', process.env.PORT || 8080);

// Base de Datos
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/chat-database';
mongoose.connect(dbURI)
    .then(db => console.log('Base de datos conectada'))
    .catch(error => console.log('Error en DB:', error));

// Sockets
require("./sockets")(io);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'Public')));

// Servidor
server.listen(app.get('port'), '0.0.0.0', () => {
    console.log("Servidor en el puerto", app.get('port'));
});
