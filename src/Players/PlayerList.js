import React, { Component } from 'react';

export class PlayerList extends Component {
  render() {
    const playerList = this.props.players.map(player => {
      return (
        <Player
          player={player}
          currentPlayer={this.props.currentPlayer}
          score={player.score}
          key={player.id}
        />
      )
    });
    return (
      <div className="player-list-container">
        {playerList}
      </div>
    )
  }
}

export class Player extends Component {
  render() {
    const colorClass = `player-${this.props.player.id + 1}`;
    const playerClasses = `player-container ${colorClass} ${this.props.player.id === this.props.currentPlayer.id ? 'selected-player' : ''}`;
    const playerNameClasses = this.props.player.hasPassed ? 'player-passed' : '';
    return (
      <div className={playerClasses} key={this.props.player.id}>
      <b className={playerNameClasses}>
        {`Player ${this.props.player.id + 1}`}
      </b>
      <PlayerScore score={this.props.score} />
    </div>
    )
  }
}

class PlayerScore extends Component {
  render() {
    return (
      <div className="player-score">{this.props.score}</div>
    );
  }
}
