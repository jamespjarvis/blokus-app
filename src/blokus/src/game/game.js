const blokus = require('../blokus/blokus');
const cloneDeep = (a) => JSON.parse(JSON.stringify(a));

const Game = (options = {}) => {

  const gameBlokus = blokus(options);
  const turns = [];

  const findPlayer = (players, playerId) => players.find(p => p.id === playerId);

  const currentPlayer = function() {
    const turns = this.turns();
    const players = gameBlokus.players();

    const everyPlayerHasPassed = players.every(player => player.hasPassed || !this.availablePieces({ player: player.id }).length);

    if (everyPlayerHasPassed) {
      return null;
    }

    let playerId = turns.length > 0 ? (turns[turns.length - 1].player + 1) % 4 : 0;
    let player = players.find(player => player.id === playerId);
    let piecesRemaining = this.availablePieces({ player: player.id });

    while (player.hasPassed || !piecesRemaining.length) {
      playerId = (playerId + 1) % 4;
      player = findPlayer(players, playerId);
    }
    return player;
  }

  const place = function({ player = null, piece, flipped = false, rotations = 0, position, probe = false, _isPass = false }) {
    if ((player !== null) && !probe) {
      return { failure: true, success: false, message: 'MustProbeIfSpecifyPlayer' };
    }

    player = player !== null ? player : this.currentPlayer().id;

    const placement = {
      player,
      piece,
      flipped,
      rotations,
      position,
      probe,
      isPass: _isPass
    };
    const placementResult = _isPass ? { success: true } : gameBlokus.place(placement);

    if (!probe) {
      if (placementResult.success) {
        const turn = Object.assign({}, placement);
        turns.push(turn);
      }
    }
    return placementResult;
  }

  const pass = function() {
    const currentPlayer = this.currentPlayer();
    const placement = { piece: null, flipped: null, rotations: null, position: null, _isPass: true };
    const placementResult = this.place(placement);

    gameBlokus.setPlayerPassed({ player: currentPlayer.id });

    return placementResult;
  }

  const isOver = function() {
    return this.currentPlayer() === null;
  }

  const numRemaining = function({ player }) {
    const pieces = this.availablePieces({ player });
    const totalCells = pieces.reduce((acc, curr) => (acc + curr.numCells), 0);
    return totalCells;
  }

  return {
    players: gameBlokus.players,
    pieces: gameBlokus.pieces,
    board: gameBlokus.board,
    turns: () => cloneDeep(turns),
    availablePieces: gameBlokus.availablePieces,
    currentPlayer,
    place,
    pass,
    isOver,
    numRemaining,
  }
}

module.exports = Game;
