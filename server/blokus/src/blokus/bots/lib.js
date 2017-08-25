function playerOccupiedCells(board, player) {
  const occupiedCells = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j] === player) {
        const position = { row: i, col: j };
        occupiedCells.push(position);
      }
    }
  }
  return occupiedCells;
}


function adjacent(position) {
  const { row, col } = position;
  return [
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col }
  ];
}

function diagonal(position) {
  const { row, col } = position;
  return [
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 }
  ];
}

function adjacencies(board, player) {
  const adjacents = [];
  const occupiedCells = playerOccupiedCells(board, player);
  for (let i = 0; i < occupiedCells.length; i++) {
    const position = occupiedCells[i];
    const adjs = adjacent(position);
    for (let j = 0; j < adjs.length; j++) {
      const adj = adjs[j];
      const occupiedByPlayer = occupiedCells.some(cell => cell.row === adj.row && cell.col === adj.col);
      if (!occupiedByPlayer) {
        adjacents.push(adj);
      }
    }
  }
  return adjacents;
}

function cornerAdjacencies(board, player) {
  const cornerAdjacents = [];
  const occupiedCells = playerOccupiedCells(board, player);
  const adjs = adjacencies(board, player);
  for (let i = 0; i < occupiedCells.length; i++) {
    const position = occupiedCells[i];
    const diagonals = diagonal(position);
    diagonals.forEach(diag => {
      const occupiedByPlayer = occupiedCells.some(cell => cell.row === diag.row && cell.col === diag.col);
      const adjacentToPlayer = adjs.some(cell => cell.row === diag.row && cell.col === diag.col);
      if (!occupiedByPlayer && !adjacentToPlayer) {
        cornerAdjacents.push(diag);
      }
    });
  }
  return cornerAdjacents;
}

function isInBounds(position, board) {
  const { row, col } = position;
  const height = board.length;
  const width = board[0].length;
  return row >= 0 && col >= 0 && row < height && col < width;
}

function freeCorners(player, board) {
  let score = 0;
  const occupiedCells = playerOccupiedCells(board, player);
  const cornerAdjs = cornerAdjacencies(board, player);
  for (let i = 0; i < cornerAdjs.length; i++) {
    const position = cornerAdjs[0];
    if (isInBounds(position, board)) {
      const isNotOccupied = board[position.row][position.col] === null;
      if (isNotOccupied) {
        const adjs = adjacent(position);
        const adjOccupiedByPlayer = adjs.some(adj => isInBounds(adj, board) && board[adj.row][adj.col] === player);
        if (!adjOccupiedByPlayer) {
          score += 1;
        }
      }
    }
  }
  return score;
}


module.exports = {
  playerOccupiedCells,
  freeCorners
}
