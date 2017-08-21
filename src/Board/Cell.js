import React, { Component } from 'react';

const isUndefined = (val) => val === undefined;

export class Cell extends Component {
  placeSelectedPiece = () => {
    if (this.props.placeSelectedPiece) {
      this.props.placeSelectedPiece(this.props.position);
    }
  }
  hoverPosition = (e) => {
    if (this.props.hoverPosition) {
      const showHover = e.type === 'mouseenter';
      this.props.hoverPosition(showHover, this.props.position);
    }
  }
  render() {
    const highlighted = !isUndefined(this.props.highlightedPositions) ? this.props.highlightedPositions.some(pos => (pos.row === this.props.position.row) && (pos.col === this.props.position.col)) : false;

    return (this.props.playerId !== null ?
      <PlayerCell
        playerId={this.props.playerId}
        placeSelectedPiece={this.placeSelectedPiece}
        hoverPosition={this.hoverPosition}
        highlighted={highlighted}
        key={this.props.position.col}
        /> :
      <EmptyCell
        placeSelectedPiece={this.placeSelectedPiece}
        hoverPosition={this.hoverPosition}
        highlighted={highlighted}
        clientPlayer={this.props.clientPlayer}
        key={this.props.position.col}
         />
    )
  }
}

class EmptyCell extends Cell {
  render() {
    const playerClass = this.props.clientPlayer ? `player-${this.props.clientPlayer.id + 1}` : '';
    const emptyCellClasses = `board-cell empty-cell ${this.props.highlighted ? 'highlighted' : ''} ${this.props.highlighted ? playerClass : ''}`;
    return (
      <div className={emptyCellClasses}
        onClick={this.props.placeSelectedPiece}
        onMouseEnter={this.props.hoverPosition}
        onMouseLeave={this.props.hoverPosition}>
      </div>
    )
  }
}

class PlayerCell extends Cell {
  render() {
    const playerClass = `player-${this.props.playerId + 1}`;
    const playerCellClasses = `board-cell ${playerClass} ${this.props.highlighted ? 'highlighted' : ''}`;
    return (
      <div className={playerCellClasses}
        onClick={this.props.placeSelectedPiece}
        onMouseEnter={this.props.hoverPosition}
        onMouseLeave={this.props.hoverPosition}>
        </div>);
  }
}
