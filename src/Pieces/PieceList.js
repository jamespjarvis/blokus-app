import React, { Component } from 'react';
import { Piece } from './Piece';

export class PieceList extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props !== nextProps || this.state !== nextState;
  }
  render() {
    const sortedPieces = this.props.pieces.sort((curr, prev) => curr.id - prev.id);
    const currentPlayer = this.props.currentPlayer;
    const pieceList = sortedPieces.map(piece => {
      return (
        <Piece
          piece={piece}
          selectedPiece={this.props.selectedPiece}
          setSelectedPiece={this.props.setSelectedPiece}
          key={piece.id}
        />
      );
    });
    const playerClass = this.props.player ? `player-${this.props.player.id + 1}` : '';
    const currentPlayerPieceList = currentPlayer && (this.props.player || {}).id === currentPlayer.id;
    const pieceListClasses = `piece-list-container ${playerClass} ${currentPlayerPieceList ? 'current-player-piece-list' : ''}`;
    const playerInfo = this.props.player ?
      (<div className="player-info">
        <div><b>{`Player ${this.props.player.id + 1}`}</b></div>
        <div>{this.props.score}</div>
      </div>) : (<div></div>);
    return (
      <div className={pieceListClasses}>
        {playerInfo}
        <div className="player-piece-list">
          {pieceList}
        </div>
      </div>
    )
  }
}
