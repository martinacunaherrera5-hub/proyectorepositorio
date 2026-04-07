const Chat = require('./models/Chat');


module.exports = function (io) {
    
    let users = {}; 

    io.on('connection', async socket => {
        console.log("Nuevo usuario conectado");
        
        let messages = await Chat.find({}). limit(8);
       socket.emit('cargando mensajes viejos',messages);
        
        
        socket.on('Nuevo usuario', (data, cb) => {
            if (data in users) { 
                 cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNickName();
                io.sockets.emit('Nuevo mensaje', {
                    msg:'Se ha unido al chat',
                    nick: socket.nickname,
                    activo: true 
                });
            }
        });

        socket.on('disconnect', () => {
            if (!socket.nickname) return;
            delete users[socket.nickname]; 
            updateNickName();
            io.sockets.emit('Nuevo mensaje', {
                msg: 'ha salido del chat',
                nick: socket.nickname,
                activo: true
            });
        });

        socket.on('Enviar mensaje', function(data, cb) {
            let msg = data.trim();

            // LÓGICA DE MENSAJE PRIVADO
            if (msg.startsWith('/w ')) { 
                let whisperContent = msg.substring(3);
                const index = whisperContent.indexOf(' ');
                
                if (index !== -1) {
                    let name = whisperContent.substring(0, index);
                    let message = whisperContent.substring(index + 1);

                    if (name in users) {
                        // Enviar al destinatario
                        users[name].emit('whisper', {
                            msg: message,
                            nick: socket.nickname
                        });
                        // Enviarme copia a mí mismo con la propiedad "to"
                        socket.emit('whisper', {
                            msg: message,
                            nick: socket.nickname,
                            to: name
                        });
                    } else {
                        cb('Error: El usuario no existe.');
                    }
                } else {
                    cb('Error: Formato incorrecto. Usa /w usuario mensaje');
                }
            } 
            // LÓGICA DE MENSAJE GLOBAL
            else {
                if (!socket.nickname) return;
                io.sockets.emit('Nuevo mensaje', {
                    msg: data,
                    nick: socket.nickname
                });
            }
        });

        function updateNickName() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
};

