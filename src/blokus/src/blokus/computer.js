function Computer(game) {
  const findMoves = (player, piece, cb) => {
    const results = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        for (let k = 0; k < 4; k++) {
          for (let l = 0; l < 2; l++) {
            const placement = {
              player: player.id,
              piece: piece.id,
              rotations: k,
              flipped: l === 1,
              position: {
                row: i,
                col: j
              },
              probe: true
            }
            const placementResult = game.place(placement);
            if (placementResult.success) {
              results.push(placement);
            }
          }
        }
      }
    }
    return cb(results);
  }
  const vectorDifferenceFromCenter = (position) => {
    return Object.values(position).map((item, i) => 10 - item);
  }
  const getDiagonalPositions = (position) => {
    const { row, col } = position;
    return [
      { row: row + 1, col: col + 1 },
      { row: row + 1, col: col - 1 },
      { row: row - 1, col: col + 1 },
      { row: row - 1, col: col - 1 }
    ];
  }
  const isOutOfBounds = (position, board) => {
    const { row, col } = position;
    const height = board.length;
    const width = board[0].length;
    return row < 0 || col < 0 || row >= height || col >= width;
  }
  const occupiedByOpposingPlayer = (player, board, position) => {
    return board[position.row][position.col] !== null && board[position.row][position.col] !== player;
  }
  const scoreResultsByDiagonals = (results) => {
    const board = game.board();
    return results.map(result => {
        const diagonals = getDiagonalPositions(result.position)
          .filter(pos => !isOutOfBounds(pos, board) && occupiedByOpposingPlayer(result.player, board, pos));
        return Object.assign(result, { score: diagonals.length });
      })
      .sort((a, b) => a.score > b.score);
  }
  const getMove = (results) => {
    return results[Math.floor(Math.random() * results.length)];
  }
  const makeMove = (move) => {
    // const { piece, flipped, rotations, position } = results[Math.floor(Math.random() * results.length)];
    const { piece, flipped, rotations, position } = move;
    return game.place({ piece, flipped, rotations, position });
  }
  const playTurn = (player, piece) => {
    let moves = findMoves(player, piece, scoreResultsByDiagonals);
    if (moves.length > 0) {
      const maxScore = moves.reduce((max, curr) => max.score > curr.score ? max : curr)[0];
      if (!maxScore) {
        moves = moves.map(move => {
            const vd = vectorDifferenceFromCenter(move.position)
              .reduce((a, b) => ((Math.abs(a) + Math.abs(b)) / 2));
            return Object.assign(move, { vScore: vd });
          })
          .sort((a, b) => a.vScore < b.vScore);
      }
      const bestMove = moves[0];
      return makeMove(bestMove);
    } else {
      const availablePieces = game.availablePieces({ player: player.id });
      const currentIndex = availablePieces.findIndex(p => (p.id === piece.id && p.numCells === piece.numCells));
      const nextPiece = availablePieces[currentIndex - 1];
      return nextPiece ? playTurn(player, nextPiece) : game.pass();
    }

  }
  const playGame = () => {
    const player = game.currentPlayer();
    const availablePieces = game.availablePieces({ player: player.id });
    if (availablePieces.length > 0) {
      const maxAvailablePieceCells = Math.max(...availablePieces.map(piece => piece.numCells));
      const largestAvailablePieces = availablePieces.filter(p => p.numCells === maxAvailablePieceCells);
      const selectedPiece = largestAvailablePieces[Math.floor(Math.random() * largestAvailablePieces.length)];
      // const selectedPiece = availablePieces.reduce((max, curr) => max.numCells > curr.numCells ? max : curr);
      playTurn(player, selectedPiece);
    } else {
      game.pass();
    }
    return game.turns();
  }
  return {
    getMove,
    playTurn,
    playGame
  }
}

module.exports = Computer;
const game = require('../game/game');

function testComputer() {
  const results = [...Array(4).fill(0)]
  let games = 0;
  for (let i = 0; i < 10; i++) {
    const gResult = playGame();

    console.log(gResult);
    gResult.forEach((player, id) => results[id] += player.score);
    games++;
  }
  return results.map((score, index) => ({player: index + 1, avgscore: score / games}));
}

function playGame() {
  const g = game();
  const c = new Computer(g);
  while (!g.isOver()) {
    c.playGame();
  }
  return g.players().map(player => Object.assign({}, { id: player.id, score: g.numRemaining({ player: player.id }) }));
}
