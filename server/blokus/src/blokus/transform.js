// transform.js
const mod = (n, k) => ((n % k) + k) % k;
const cloneDeep = (a) => JSON.parse(JSON.stringify(a));

const flip = (shape) => {
  const width = shape[0].length;
  const flippedShape = cloneDeep(shape);
  shape.forEach((row, rowIdx) => row.forEach((cell, colIdx) => flippedShape[rowIdx][width - 1 - colIdx] = cell));
  return flippedShape;
}


const rotateOnce = (shape) => {
  const d = shape.length;
  const n = Math.floor(d / 2);
  let newShape = cloneDeep(shape);
  if (shape.length % 2 === 0) {
    newShape.splice(n, 0, Array(d).fill(null));
    newShape.forEach(row => row.splice(n, 0, null));
    newShape = rotateOnce(newShape);
    newShape.splice(n, 1);
    newShape.forEach(row => row.splice(n, 1));
  } else {
    shape.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        newShape[-1 * colIdx + 2 * n][rowIdx] = cell;
      });
    });
  }
  return newShape;
}

const rotate = (shape, rotations = 0) => {
  shape = padToSquare(shape);
  rotations = mod(rotations, 4);
  [...Array(rotations).keys()].forEach(() => shape = rotateOnce(shape));
  shape = unpadFromSquare(shape);
  return shape;
}

const padToSquare = (shape) => {
  let newShape = Array.from(shape);
  let height = shape.length;
  let width = shape[0].length;

  while (height > width) {
    newShape = newShape.map(row => row.concat(['O']));
    width = newShape[0].length;
  }

  while (width < height) {
    let newRow = [];
    for (let i = 0; i < width; i++) {
      newRow.push('0');
    }
    newShape.concat(newRow);
    height = newShape.length;
  }

  return newShape;
}

const unpadFromSquare = (shape) => {
  shape = shape.filter(row => row.includes('X'));

  const width = shape[0].length;
  const columnsToRemove = [...Array(width).keys()].filter(index => shape.every(row => row[index] === 'O'));

  return shape.map(row => row.filter((cell, colIdx) => !columnsToRemove.includes(colIdx)));
}

module.exports = { rotate, flip, padToSquare, unpadFromSquare };
