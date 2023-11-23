const express = require('express');
const http = require('http').Server(express());
const io = require('socket.io')(http);

const app = express(); // Ajoutez cette ligne

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  // Écoutez les messages du client
  socket.on('message', (data) => {
    console.log('Message reçu du client:', data);

    // Diffusez le message à tous les clients connectés
    io.emit('message', data);
  });

  // Autres événements et logique ici...

  // Déconnexion de l'utilisateur
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});

const PORT = 19006;
http.listen(PORT, () => {
  console.log(`Serveur Socket.IO en cours d'exécution sur le port ${PORT}`);
});
