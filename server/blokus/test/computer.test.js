const game = require('../src/game/game');
const Computer = require('../src/blokus/bots/computer');

const g = game();

while (!g.isOver()) {
  const c = new Computer(g);
  c.play();
}
