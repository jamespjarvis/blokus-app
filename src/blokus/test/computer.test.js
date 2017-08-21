const chai = require('chai');
const assert = chai.assert;

const Computer = require('../src/blokus/computer');

describe('computer.js', () => {
  describe('new computer player', () => {
    it('should create a new computer player', () => {
      const computer = new Computer();
      assert.isOk(computer);
    });
  });
});
