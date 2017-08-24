const game = require('../../game/game');
const Computer = require('./computer');

const g = game();
const c = Computer(g);

while (!g.isOver()) {
  c.play();
}
