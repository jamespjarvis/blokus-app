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

function adjacencies(occupiedCells, board, player) {
  // const occupiedCells = playerOccupiedCells(board, player);
  for (let i = 0; i < occupiedCells.length; i++) {
    const position = occupiedCells[i];
    const adjs = adjacent(position);
    adjs.forEach(adj => {
      const occupiedByPlayer = occupiedCells.some(cell => {
        return cell.row === adj.row && cell.col === adj.col;
      });
      if (!occupiedByPlayer) {
        occupiedCells.push(adj);
      }
    });
  }
  return occupiedCells;
}

function cornerAdjacencies(occupiedCells, board, player) {
  const cornerAdjacents = [];
  // const occupiedCells = playerOccupiedCells(board, player);
  console.time('caAdjs');
  const adjs = adjacencies(occupiedCells, board, player);
  console.timeEnd('caAdjs')
  for (let i = 0; i < occupiedCells.length; i++) {
    const position = occupiedCells[i];
    const diagonals = diagonal(position);
    diagonals.forEach(diag => {
      const occupiedByPlayer = occupiedCells.some(cell => {
        return cell.row === diag.row && cell.col === diag.col;
      });
      const adjacentToPlayer = adjs.some(cell => {
        return cell.row === diag.row && cell.col === diag.col;
      });
      if (!occupiedByPlayer && !adjacentToPlayer) {
        cornerAdjacents.push(diag);
      }
    });
  }
  return cornerAdjacents;
}

module.exports = {
  adjacent,
  cornerAdjacencies
}
