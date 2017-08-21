import React, { Component } from 'react';
import io from 'socket.io-client';

const socket = io();

export class GameSelection extends Component {
  constructor(props) {
    super(props);
    this.newGameId = Math.random().toString(36).substr(2, 10);
    this.state = {
      joinGameId: ''
    };
  }

  navigateToJoinedGame = () => {
    this.props.history.push(`/${this.state.joinGameId}`);
  }

  navigateToNewGame = () => {
    socket.emit('create:game', { gameId: this.newGameId });
    this.props.history.push(`/${this.newGameId}`);
  }

  render() {
    const joinGameClasses = `join-game-button ${this.state.joinGameId.length ? '': 'disabled'}`;
    return (
      <div className="game-selection-container">
        <div className="new-game-container">
          <button className="new-game-button"
               onClick={this.navigateToNewGame}>
            New Game
          </button>
        </div>
        <div className="join-game-container">
          <input className="join-game-input"
                 type="text"
                 value={this.state.joinGameId}
                 onChange={e => this.setState({joinGameId: e.target.value})} />
          <button className={joinGameClasses}
               onClick={this.navigateToJoinedGame}>
            Join Game
          </button>
        </div>
      </div>
    );
  }
}
