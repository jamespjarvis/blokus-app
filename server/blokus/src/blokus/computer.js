function Computer(game) {
  let moveCount = 0;
  // each players starting corner
  const getCorrectCornerPosition = (player, board) => {
    const cornerPositions = getCornerPositions(board);
    return cornerPositions[player];
  }
  // return starting corners with indexes corresponding to player id
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
  // get positionas adjacent to a cell on the board
  const getAdjacentPositions = (position) => {
    const { row, col } = position;
    return [
      { row, col: col + 1 },
      { row, col: col - 1 },
      { row: row + 1, col },
      { row: row - 1, col }
    ];
  }
  // get positions diagonal from a cell on the board
  const getDiagonalPositions = (position) => {
    const { row, col } = position;
    return [
      { row: row + 1, col: col + 1 },
      { row: row + 1, col: col - 1 },
      { row: row - 1, col: col + 1 },
      { row: row - 1, col: col - 1 }
    ];
  }
  // determine whether a position is not on the board
  const isOutOfBounds = (position, board) => {
    const { row, col } = position;
    const height = board.length;
    const width = board[0].length;
    return row < 0 || col < 0 || row >= height - 1 || col >= width - 1;
  }
  // determine whether it is a player's first move
  const isFirstMove = (player, board) => {
    return !board.some(row => row.some(cell => cell === player));
  }
  // get number of cells away from center of board
  const distanceToCenter = (position) => {
    // chebyshev distance
    return Math.max(Math.abs(9.5 - position.row), Math.abs(9.5 - position.col));
  }
  // get number of cells away from starting corner
  const distanceFromCorner = (position, player, board) => {
    const corner = getCorrectCornerPosition(player, board);
    return Math.max(Math.abs(corner.row - position.row), Math.abs(corner.col - position.col));
  }
  // calculate a score based on the players available free corners and current board state
  const freeCorners = (player, board) => {

    let score = 0;

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        // if board cell is occupied by player
        if (board[i][j] === player.id) {

          const position = { row: i, col: j };

          const diagonals = getDiagonalPositions(position);

          diagonals.forEach(d => {
            const diagonalAdjacents = getAdjacentPositions(d);
            diagonalAdjacents.forEach(adj => {
              if (!isOutOfBounds(adj, board)) {
                if (board[adj.row][adj.col] === null) {
                  score += 1;
                } else {
                  if (board[adj.row][adj.col] !== player.id) {
                    score += 1;
                  } else {
                    score -= 1;
                  }
                }
              } else {
                score -= 1;
              }
            });
          });

          const adjacents = getAdjacentPositions(position);

          adjacents.forEach(adj => {
            if (!isOutOfBounds(adj, board)) {
              if (board[adj.row][adj.col] !== null && board[adj.row][adj.col] !== player.id) {
                const opponent = board[adj.row][adj.col];
                const opponentDiagonals = getDiagonalPositions({ row: adj.row, col: adj.col });
                opponentDiagonals.forEach(d => {
                  if (!isOutOfBounds(d, board)) {
                    // is opponent corner piece
                    if (board[d.row][d.col] === opponent) {
                      // and not a cell diagonal to one of the player's cells
                      const isPlayerDiagonal = diagonals.find(p => p.row === d.row && p.col === d.col);
                      if (isPlayerDiagonal === undefined) {
                        score += 1;
                      } else {
                        score -= 1;
                      }
                    }
                  }
                });
              }
            } else {
              score -= 1;
            }
          });
        }
      }
    }

    return score;
  }

  const play = () => {
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
      const cornerDistanceScore = result.positions.reduce((total, curr) => (distanceFromCorner(curr, player.id, testBoard)), 0);

      const score = (freeCornerScore + ((pieceIdScore * cornerDistanceScore) / distanceScore))
      console.log({ freeCornerScore, cornerDistanceScore, distanceScore, pieceIdScore, score });
      return Object.assign(result, { score });
    });

    if (scoredResults.length) {

      const move = scoredResults.reduce((a, b) => a.score > b.score ? a : b);

      const { piece, flipped, rotations, position } = move;

      game.place({ piece, flipped, rotations, position });
      moveCount++;

    } else {

      game.pass();

    }

    return game.turns();

  }
  return {
    play
  }
}

module.exports = Computer;
