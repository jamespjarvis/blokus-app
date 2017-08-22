// placement.js

const { flip, rotate } = require('./transform');

function getShapePositions(shape, position) {
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


const getPlacementPositions = (piece, flipped, rotations, position) => {
  const { shape } = piece;
  const flippedShape = flipped ? flip(shape) : shape;
  const flippedRotatedShape = rotate(flippedShape, rotations);
  const placementPositions = getShapePositions(flippedRotatedShape, position);
  return placementPositions;
}

const isOutOfBounds = (position, board) => {
  const { row, col } = position;
  const height = board.length;
  const width = board[0].length;
  return row < 0 || col < 0 || row >= height || col >= width;
}

const isTaken = (position, board) =>
  !isOutOfBounds(position, board) && board[position.row][position.col] !== null;

function isAdjacentToSamePlayer(position, board, player) {
  const adjacentPositions = getAdjacentPositions(position);
  return adjacentPositions.some(pos => !isOutOfBounds(pos, board) && board[pos.row][pos.col] === player);
}

function getAdjacentPositions(position) {
  const { row, col } = position;
  return [
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col }
  ];
}

function isDiagonalFromSamePlayer(position, board, player) {
  const diagonalPositions = getDiagonalPositions(position);
  return diagonalPositions.some(pos => !isOutOfBounds(pos, board) && board[pos.row][pos.col] === player);
}

function getDiagonalPositions(position) {
  const { row, col } = position;
  return [
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 }
  ]
}

function isInCorner(position, board) {
  const cornerPositions = getCornerPositions(board);
  return cornerPositions
    .some(pos => (pos.row === position.row) && (pos.col === position.col));
}

function getCornerPositions(board) {
  const height = board.length;
  const width = board[0].length;
  return [
    { row: 0, col: 0 },
    { row: 0, col: width - 1 },
    { row: height - 1, col: width - 1 },
    { row: height - 1, col: 0 }
  ]
}

const validatePiece = (piece) => {
  if (!piece) return 'PieceDoesNotExist';
  if (piece.used) return 'PieceAlreadyUsed';
}

const positionInCorrectCorner = (player, board, positions) => {
  const cornerPositions = getCornerPositions(board);
  const correctCorner = cornerPositions[player];
  return positions.some(pos => correctCorner.row === pos.row && correctCorner.col === pos.col);
}

const validatePlacementPositions = (positions, board, player) => {
  const anyPositionsOutOfBounds = positions.some(pos => isOutOfBounds(pos, board));
  if (anyPositionsOutOfBounds) return 'PositionOutOfBounds';
  const anyTakenPositions = positions.some(pos => isTaken(pos, board));
  if (anyTakenPositions) return 'PositionTaken';

  const anyPositionsAdjacentToSamePlayer = positions.some(pos => isAdjacentToSamePlayer(pos, board, player));

  if (anyPositionsAdjacentToSamePlayer) return 'PositionAdjacentToSamePlayer';
  const isFirstTurn = board.some(row => row.includes(player));
  if (isFirstTurn) {
    const noPositionsDiagonalFromSamePlayer = positions.some(pos => isDiagonalFromSamePlayer(pos, board, player));
    if (!noPositionsDiagonalFromSamePlayer) return 'PositionNotDiagonalFromSamePlayer';
  } else {
    const noPositionsInCorner = positions.some(pos => isInCorner(pos, board));
    if (!noPositionsInCorner) return 'PositionNotInCorner';
    const isPositionInCorrectCorner = positionInCorrectCorner(player, board, positions);
    if (!isPositionInCorrectCorner) return 'PositionNotInCorrectCorner';
  }
}

const getPlaceFunction = (pieces, board) => {
  const placeFunction = ({ player, piece, flipped = false, rotations = 0, position, probe = false }) => {
    const matchingPiece = pieces.find(p => p.id === piece && p.player === player);

    const pieceValid = validatePiece(matchingPiece);

    if (typeof pieceValid === 'string') {
      return { success: false, failure: true, message: pieceValid }
    }

    const placementPositions = getPlacementPositions(matchingPiece, flipped, rotations, position);

    const placementPositionsValid = validatePlacementPositions(placementPositions, board, player);

    if (typeof placementPositionsValid === 'string') {
      return { success: false, failure: true, message: placementPositionsValid, positions: placementPositions };
    }

    if (!probe) {
      placementPositions.forEach(pos => {
        const { row, col } = pos;
        board[row][col] = player;
      });
      matchingPiece.used = true;
    }
    return { success: true, positions: placementPositions };
  };

  return placeFunction;
}

module.exports = { getPlaceFunction, getDiagonalPositions };
