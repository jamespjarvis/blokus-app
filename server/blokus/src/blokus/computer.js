function Computer(game) {
  let moveCount = 0;
  const findAvailablePositionsForMove = (player) => {
    const results = [];
    const board = game.board();
    board.forEach((row, rowIdx) => {
      row.forEach((col, colIdx) => {
        if (board[rowIdx][colIdx] === player) {
          const position = { row: rowIdx, col: colIdx };
          const diagonals = getDiagonalPositions(position).filter(pos => {
            const adjs = getAdjacentPositions(pos).filter(p => !isOutOfBounds(p, board)).some(p => board[p.row][p.col] === player.id);
            return !isOutOfBounds(pos, board) && !adjs && board[pos.row][pos.col] === null;
          });
          results.push(...diagonals);
        }
      });
    });
    return results.concat([getCorrectCornerPosition(player, board)]);
  }
  const getCorrectCornerPosition = (player, board) => {
    const cornerPositions = getCornerPositions(board);
    return cornerPositions[player];
  }
  const getCornerPositions = (board) => {
    const height = board.length;
    const width = board[0].length;
    return [
      { row: 0, col: 0 },
      { row: 0, col: width - 1 },
      { row: height - 1, col: width - 1 },
      { row: height - 1, col: 0 }
    ]
  }

  const findAndTestAvailablePositions = (player, pieces, cb) => {
    let results = [];
    const maxAvailablePieceCells = Math.max(...pieces.map(piece => piece.numCells));
    const largestAvailablePieces = pieces.filter(p => p.numCells === maxAvailablePieceCells);
    const availablePositions = findAvailablePositionsForMove(player.id);
    availablePositions.forEach(position => {
      largestAvailablePieces.forEach(piece => {
        const pieceSize = piece.shape.length;
        for (let i = 0; i < pieceSize; i++) {
          for (let j = 0; j < pieceSize; j++) {
            for (let k = 0; k < 2; k++) {
              const rowFactor = k === 0 ? -1 : 1;
              for (let l = 0; l < 2; l++) {
                const colFactor = l === 0 ? -1 : 1;
                for (let m = 0; m < 4; m++) {
                  for (let n = 0; n < 2; n++) {
                    const placement = {
                      player: player.id,
                      piece: piece.id,
                      rotations: m,
                      flipped: n === 1,
                      position: {
                        row: position.row + (i * rowFactor),
                        col: position.col + (j * colFactor)
                      },
                      probe: true
                    }
                    const placementResult = game.place(placement);
                    if (placementResult.success) {
                      const score = getPositionScore(player.id, piece, placement.position);
                      placement.score = score;
                      if (!results.some(result => result.score >= score)) {
                        results.push(placement);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    });
    return results.length ? cb(results) : findMoves(player, pieces, cb);
  }
  const findMoves = (player, pieces, cb) => {
    const results = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        pieces.forEach(piece => {
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
        });
      }
    }
    return cb(results);
  }
  const getAdjacentPositions = (position) => {
    const { row, col } = position;
    return [
      { row, col: col + 1 },
      { row, col: col - 1 },
      { row: row + 1, col },
      { row: row - 1, col }
    ];
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
    return row < 0 || col < 0 || row >= height - 1 || col >= width - 1;
  }
  const occupiedByOpposingPlayer = (player, board, position) => {
    return board[position.row][position.col] !== null && board[position.row][position.col] !== player;
  }
  const scoreResultsByAdjacents = (results) => {
    const board = game.board();
    return results.map(result => {
      const adjacents = getAdjacentPositions(result.position)
        .filter(pos => !isOutOfBounds(pos, board) && occupiedByOpposingPlayer(result.player, board, pos));
      return Object.assign(result, { adjacentScore: adjacents.length })
    });
  }
  const scoreResultsByDiagonals = (results) => {
    const board = game.board();
    return results.map(result => {
      const diagonals = getDiagonalPositions(result.position)
        .filter(pos => !isOutOfBounds(pos, board) && occupiedByOpposingPlayer(result.player, board, pos));
      return Object.assign(result, { diagonalScore: diagonals.length });
    });
  }
  const combineScores = (results) => {
    return results.map(result => Object.assign(result, { score: result.adjacentScore + result.diagonalScore + result.piece }));
  }
  const getShapePositions = (shape, position) => {
    const shapePositions = [];
    let leftCol = null;
    shape.forEach((row, rowIdx) => row.forEach((cell, colIdx) => {
      if (cell === 'X') {
        if (leftCol === null) {
          leftCol = position.col - colIdx;
        }
        shapePositions.push({
          row: position.row + rowIdx,
          col: leftCol + colIdx
        });
      }
    }));
    return shapePositions;
  }

  const getPositionScore = (player, piece, position) => {
    const board = game.board();
    const { shape } = game.pieces().find(p => p.id === piece.id);
    const shapePositions = getShapePositions(shape, position);
    let score = piece.id;
    shapePositions.forEach(pos => {
      const diagonals = getDiagonalPositions(pos).filter(p => !isOutOfBounds(p, board) && occupiedByOpposingPlayer(player, board, pos));;
      const adjacents = getAdjacentPositions(pos).filter(p => !isOutOfBounds(p, board) && occupiedByOpposingPlayer(player, board, pos));;
      score += (diagonals.length * 2) + adjacents.length;
    });
    return score;
  }


  const totalPositionScore = (results) => {
    return results;
  }
  const getMove = (results) => {
    return results[Math.floor(Math.random() * results.length)];
  }
  const makeMove = (move) => {
    // const { piece, flipped, rotations, position } = results[Math.floor(Math.random() * results.length)];
    const { piece, flipped, rotations, position } = move;
    moveCount++;
    console.log(`Move: ${moveCount}\nPlayer: ${move.player}\nScore: ${move.score}`);
    return game.place({ piece, flipped, rotations, position });
  }
  const playTurn = (player, piece) => {
    let moves = findMoves(player, piece, totalPositionScore);
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
  const playBestMove = (bestPositions) => {
    const bestMove = bestPositions.reduce((move1, move2) => {
      return move1.score > move2.score ? move1 : move2;
    });
    return makeMove(bestMove);
  }
  const findBestMove = (player, pieces) => {
    // const maxAvailablePieceCells = Math.max(...pieces.map(piece => piece.numCells));
    // const largestAvailablePieces = pieces.filter(p => p.numCells === maxAvailablePieceCells);
    console.time('findbestmove');
    const bestPositions = findAndTestAvailablePositions(player, pieces, totalPositionScore);
    // const bestMove = testAvailablePositions.reduce((pieceMoves1, pieceMoves2) => {
    //   const bestMove1 = pieceMoves1.length ? pieceMoves1.reduce((m1, m2) => m1.score > m2.score ? m1 : m2) : 0;
    //   const bestMove2 = pieceMoves2.length ? pieceMoves2.reduce((m1, m2) => m1.score > m2.score ? m1 : m2) : 0;
    //   return bestMove1.score > bestMove2.score ? bestMove1 : bestMove2;
    // });
    console.timeEnd('findbestmove');
    return bestPositions.length ? playBestMove(bestPositions) : game.pass();
  }
  const playGame = () => {
    const player = game.currentPlayer();
    const availablePieces = game.availablePieces({ player: player.id });
    if (availablePieces.length > 0) {
      // const maxAvailablePieceCells = Math.max(...availablePieces.map(piece => piece.numCells));
      // const largestAvailablePieces = availablePieces.filter(p => p.numCells === maxAvailablePieceCells);
      // const moveResultsByPiece = largestAvailablePieces.map(piece => findMoves(player, piece, scoreResultsByDiagonals)[0]);
      // console.log(moveResultsByPiece);
      // const selectedPiece = largestAvailablePieces[Math.floor(Math.random() * largestAvailablePieces.length)];
      // const selectedPiece = availablePieces.reduce((max, curr) => max.numCells > curr.numCells ? max : curr);
      findBestMove(player, availablePieces);
    } else {
      game.pass();
    }
    return game.turns();
  }
  return {
    getMove,
    playTurn,
    playGame,
    findBestMove,
    findAvailablePositionsForMove
  }
}

module.exports = Computer;

const game = require('../game/game');

function testComputer() {
  const results = [...Array(4).fill(0)]
  let games = 0;
  console.time('onegame');
  for (let i = 0; i < 1; i++) {
    const gResult = playGame();
    console.log(gResult);
    gResult.forEach((player, id) => results[id] += player.score);
    games++;
    console.timeEnd('onegame');
  }
  return results.map((score, index) => ({ player: index + 1, avgscore: score / games }));
}

function playGame() {
  const g = game();
  const c = new Computer(g);
  while (!g.isOver()) {
    c.playGame();
  }
  return g.players().map(player => Object.assign({}, { id: player.id, score: g.numRemaining({ player: player.id }) }));
}
// playGame();
testComputer();
