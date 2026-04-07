
const http = require('http');

const path = require('path');

const express = require('express');

const app = express();

const socketio=require('socket.io');

const mongoose = require('mongoose');

const { error, log } = require('console');

const server=http.createServer(app);

const io=socketio(server);

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/chat-database';

mongoose.connect('dbURI')
        .then(db => console.log('base de datos conectada'))
        .catch(error => console.log('error en DB',error) );

app.set('port', process.env.PORT || 8080);
require("./sockets")(io);
app.use(express.static(path.join(__dirname,'Public')));

server.listen(app.get('port'),  '0.0.0.0', ()=>{
    console.log("Servidor en el puerto",app.get('port'));
})