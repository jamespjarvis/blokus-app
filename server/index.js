#!/usr/bin/node

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const { game } = require('./blokus/src/index');
const Computer = require('./blokus/src/blokus/bots/computer');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
} else {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('../config/webpack.config.dev');
  app.use(webpackDevMiddleware(webpack(webpackConfig), { publicPath: '/' }));
}

const currentGames = {};

io.on('connection', (socket) => {
  let clientGameId = null;
  let clientPlayer = null;

  socket.on('create:game', function({ gameId }) {
    currentGames[gameId] = {
      savedTurns: [],
      connectedPlayers: []
    }
  });

  socket.on('join:game', function({ gameId }) {
    if (currentGames.hasOwnProperty(gameId)) {

      Object.keys(socket.rooms)
        .forEach(room => socket.leave(socket.rooms[room]));

      socket.join(gameId, () => {
        clientGameId = gameId;
        const connectedPlayers = currentGames[gameId].connectedPlayers;
        const diff = [...Array(4).keys()].diff(connectedPlayers);
        clientPlayer = connectedPlayers.length >= 4 ? null : Math.min(...diff);
        if (clientPlayer !== null) {
          currentGames[gameId].connectedPlayers.push(clientPlayer)
        };
        socket.emit('joined:game', { player: clientPlayer, playerList: currentGames[gameId].connectedPlayers });
        socket.emit('take:turn', { turns: currentGames[gameId].savedTurns });
      });

    } else {
      socket.emit('nonexistant:game', { gameId });
    }
  });
  socket.on('update:players', ({ gameId }) => {
    socket.emit('update:players', ({ players: currentGames[gameId].connectedPlayers }));
  });

  socket.on('take:turn', function({ turns }) {
    const savedTurns = currentGames[clientGameId].savedTurns;
    const clientPrevTurns = turns.slice(0, turns.length - 1);
    if (deepEqual(savedTurns, clientPrevTurns)) {
      currentGames[clientGameId].savedTurns = turns;
      io.to(clientGameId).emit('take:turn', { turns });
    }
  });

  socket.on('computer:turn', ({ turns }) => {
    const g = game();
    const c = Computer(g);
    turns.forEach(turn => {
      if (turn.isPass) {
        g.pass();
      } else {
        const placement = {
          piece: turn.piece,
          flipped: turn.flipped,
          rotations: turn.rotations,
          position: turn.position
        }
        g.place(placement);
      }
    });
    currentGames[clientGameId].savedTurns = c.play();
    io.to(clientGameId).emit('take:turn', { turns: g.turns() });
  });
  const tearDown = function() {
    socket.leave(clientGameId, () => {
      if (currentGames.hasOwnProperty(clientGameId)) {
        currentGames[clientGameId].connectedPlayers
          .splice(currentGames[clientGameId].connectedPlayers.indexOf(clientPlayer), 1);
        io.to(clientGameId).emit('update:players', ({ players: currentGames[clientGameId].connectedPlayers }));
      }
      clientGameId = null;
      clientPlayer = null;
    });
  }

  socket.on('leave:game', tearDown);
  socket.on('disconnect', tearDown);
});

Array.prototype.diff = function(arr) {
  return this.filter(i => arr.indexOf(i) === -1);
}

function deepEqual(arr1, arr2) {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
