function Computer() {
  let moveCount = 0;
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
  const isFirstMove = (player, board) => {
    return !board.some(row => row.some(cell => cell === player));
  }

  const distanceToCenter = (position) => {
    // chebyshev distance
    return Math.max(Math.abs(10 - position.row), Math.abs(10 - position.col));
  }

  const freeCorners = (player, board) => {

    let score = 0;

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        if (board[i][j] === player.id) {
          const position = { row: i, col: j };
          const diagonals = getDiagonalPositions(position);
          diagonals.forEach(d => {
            const diagonalAdjacents = getAdjacentPositions(d);
            diagonalAdjacents.forEach(adj => {
              if (!isOutOfBounds(adj, board)) {
                // if adjacent position is occupied by opposing player - potential bloke
                if (board[adj.row][adj.col] !== null && board[adj.row][adj.col] !== player.id || board[adj.row][adj.col] === null) {
                  score += 1;
                }
              } else {
                score -= 1;
              }
            });
          });

          const adjacents = getAdjacentPositions(position);
          adjacents.forEach(adj => {
            if (!isOutOfBounds(adj, board)) {
              if (board[adj.row][adj.col] !== null) {
                const opponent = board[adj.row][adj.col];
                const opponentDiagonals = getDiagonalPositions({ row: adj.row, col: adj.col });
                opponentDiagonals.forEach(d => {
                  if (!isOutOfBounds(d, board)) {
                    // is opponent corner piece
                    if (board[d.row][d.col] === opponent) {
                      const isPlayerDiagonal = diagonals.find(p => p.row === d.row && p.col === d.col);
                      if (isPlayerDiagonal === undefined) {
                        score += 2;
                      } else {
                        score -= 2;
                      }
                    }
                  }
                });
              }
            } else {
              score -= 2;
            }
          });
        }
      }
    }

    return score;
  }

  const play = (game) => {
    const board = game.board();
    const player = game.currentPlayer();

    const availablePositions = [];

    const firstMove = isFirstMove(player.id, board);

    if (firstMove) {

      availablePositions.push(getCorrectCornerPosition(player.id, board));

    } else {

      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          if (board[i][j] === player.id) {
            const position = { row: i, col: j };
            const diagonals = getDiagonalPositions(position);
            diagonals.forEach(d => {
              const adjacents = getAdjacentPositions(d);
              if (adjacents.some(adj => !isOutOfBounds(adj, board) && board[adj.row][adj.col] === null)) {
                availablePositions.push(d);
              }
            });
          }
        }
      }

    }

    const results = [];

    const pieces = game.availablePieces({ player: player.id });

    availablePositions.forEach(position => {
      const { row, col } = position;
      pieces.forEach(piece => {

        const pieceWidth = piece.shape.length;
        const pieceHeight = piece.shape[0].length

        for (let i = 0; i < pieceWidth; i++) {
          for (let j = 0; j < pieceHeight; j++) {
            for (let k = 0; k < 4; k++) {
              for (let l = 0; l < 2; l++) {
                const placement = {
                  player: player.id,
                  piece: piece.id,
                  rotations: k,
                  flipped: l === 1,
                  position: {
                    row: row + i,
                    col: col + j
                  },
                  probe: true
                }
                const placementResult = game.place(placement);
                if (placementResult.success) {
                  placement.positions = placementResult.positions;
                  results.push(placement);
                }
              }
            }
          }
        }
        for (let i = 0; i < pieceWidth; i++) {
          for (let j = 0; j < pieceHeight; j++) {
            for (let k = 0; k < 4; k++) {
              for (let l = 0; l < 2; l++) {
                const placement = {
                  player: player.id,
                  piece: piece.id,
                  rotations: k,
                  flipped: l === 1,
                  position: {
                    row: row + (i * -1),
                    col: col + (j * -1)
                  },
                  probe: true
                }
                const placementResult = game.place(placement);
                if (placementResult.success) {
                  placement.positions = placementResult.positions;
                  results.push(placement);
                }
              }
            }
          }
        }
      });
    });

    const scoredResults = results.map(result => {
      const testBoard = game.board();
      result.positions.forEach(p => testBoard[p.row][p.col] === player.id);
      const freeCornerScore = freeCorners(player, testBoard);
      const pieceIdScore = result.piece;
      const distanceScore = result.positions.reduce((total, curr) => (distanceToCenter(curr)), 0);
      return Object.assign(result, { score: (freeCornerScore / distanceScore) + pieceIdScore });
    });

    if (scoredResults.length) {

      const move = scoredResults.reduce((a, b) => a.score > b.score ? a : b);

      const { piece, flipped, rotations, position } = move;

      game.place({ piece, flipped, rotations, position });
      moveCount++;
      console.log({ moves: scoredResults.length, turn: moveCount, highestScore: move });

    } else {

      game.pass();

      console.log('passing!');
    }

    return game.turns();

  }
  return {
    play
  }
}

module.exports = Computer;
