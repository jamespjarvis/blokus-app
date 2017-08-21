import React, { Component } from 'react';

import { Board } from '../Board/Board';
import { transform } from '../blokus/src/index';

const { flip, rotate } = transform;

export class Piece extends Component {
  clickPiece = () => {
    if (this.props.setSelectedPiece) {
      this.props.setSelectedPiece(this.props.piece);
    }
  }
  render() {
    const playerId = this.props.piece.player;
    const shape = this.props.piece.shape;
    const flippedShape = this.props.flipped ? flip(shape) : shape;
    const flippedRotatedShape = this.props.rotations ? rotate(flippedShape, this.props.rotations) : flippedShape;
    const shapeBoard = flippedRotatedShape.map(row => row.map(cell => cell === 'X' ? playerId : null));
    const pieceClasses = `piece-container ${(this.props.selectedPiece && (this.props.piece.id === this.props.selectedPiece.id)) ? 'selected-piece' : ''}`;
    return (
      <div className={pieceClasses}
        onClick={this.clickPiece}>
        <Board board={shapeBoard} />
      </div>
    );
  }
}
