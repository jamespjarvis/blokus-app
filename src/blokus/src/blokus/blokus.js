const {
  processOptions,
  generatePieces,
  generateBoard
} = require('./initialize');

const cloneDeep = (a) => JSON.parse(JSON.stringify(a));

const { getPlaceFunction } = require('./placement');

const Blokus = (options = {}) => {
  const { height, width, players } = processOptions(options);

  const pieces = generatePieces();
  const board = generateBoard(height, width);


  const place = getPlaceFunction(pieces, board);

  const availablePieces = function({ player, numCells }) {
    if (typeof numCells === 'number') {
      return this.pieces().filter(piece => {
        return piece.player === player && piece.used === false && piece.numCells === numCells;
      })
    } else {
      return this.pieces().filter(piece => {
        return piece.player === player && piece.used === false;
      });
    }
  }

  const setPlayerPassed = function({ player }) {
    const playerThatPassed = players.find(p => p.id === player);
    playerThatPassed.hasPassed = true;
  }

  return {
    players: () => cloneDeep(players),
    pieces: () => cloneDeep(pieces),
    board: () => cloneDeep(board),
    place,
    availablePieces,
    setPlayerPassed
  }
}

module.exports = Blokus;
