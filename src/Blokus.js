import React, { Component } from 'react';
import io from 'socket.io-client';

import { Board } from './Board/Board';
import { game } from './blokus/src/index';
import './Blokus.css';

import { Piece } from './Pieces/Piece';
import { PieceList } from './Pieces/PieceList';

import { PassButton } from './Control/PassButton';
import { PieceTransform } from './Control/PieceTransform';

import { GameOver } from './Alerts/GameOver';

const socket = io('http://localhost:8012');


export class Blokus extends Component {
  constructor(props) {
    super(props);
    this.gameId = this.props.match.params.gameId;
    this.state = {
      joined: false,
      clientPlayer: null,
      playerList: [],
      ...this.getInitialGameState()
    }
  }
  componentDidMount() {
    socket.emit('join:game', { gameId: this.gameId });
    socket.on('joined:game', ({ player, playerList }) => {
      const players = this.game.players();
      const clientPlayer = players.find(p => p.id === player);
      this.setState({ joined: true, clientPlayer, playerList });
      socket.emit('update:players');
    });

    socket.on('nonexistant:game', ({ gameId }) => {
      this.props.history.push('/');
    });

    socket.on('update:players', ({ players }) => {
      this.setState({ playerList: players });
    });

    socket.on('take:turn', ({ turns }) => {
      this.catchUpTurns(turns);
      this.updateStateAfterTurn();
      console.log('taking turn?');
    });

    socket.on('disconnect', () => {
      // alert('you have been disconnected');
      this.props.history.push('/');
    });
  }
  componentWillUnmount() {
    socket.emit('leave:game');
    socket.off('joined:game');
    socket.off('nonexistant:game');
    socket.off('take:turn');
  }
  getInitialGameState = () => {
    this.game = game();
    const board = this.game.board();
    const currentPlayer = this.game.currentPlayer();
    const clientPlayer = (this.state || {}).clientPlayer;
    let selectedPiece;
    if (clientPlayer) {
      const clientPlayerAvailablePieces = this.game.availablePieces({ player: clientPlayer.id });
      selectedPiece = clientPlayerAvailablePieces.reduce((max, curr) => max.id > curr.id ? max : curr);
    } else {
      selectedPiece = null;
    }
    return {
      board,
      currentPlayer,
      selectedPiece,
      selectedFlipped: false,
      selectedRotations: 0,
      highlightedPositions: []
    };
  }
  updateStateAfterTurn = () => {
    const board = this.game.board();
    const playerList = this.state.playerList;
    const currentPlayer = this.game.currentPlayer();

    if (currentPlayer !== null && !playerList.includes(currentPlayer.id)) {
      const turns = this.game.turns();
      socket.emit('computer:turn', { turns });
    }

    const clientPlayer = this.state.clientPlayer;
    let selectedPiece = this.state.selectedPiece || {};
    if (clientPlayer) {
      const clientAvailablePieces = this.game.availablePieces({ player: clientPlayer.id });
      const availablePieceIds = clientAvailablePieces.map(piece => piece.id);
      if (!availablePieceIds.includes(selectedPiece.id) && clientAvailablePieces.length) {
        selectedPiece = clientAvailablePieces.reduce((max, curr) => max.id > curr.id ? max : curr);
      }
    } else {
      selectedPiece = null;
    }

    this.setState({
      board,
      currentPlayer,
      selectedPiece,
      selectedFlipped: false,
      selectedRotations: 0
    });
  }
  catchUpTurns = (turns) => {
    const previousSavedTurns = turns.slice(0, turns.length - 1);
    const clientTurns = this.game.turns();
    let turnsToCatchUp;
    if (clientTurns.length !== previousSavedTurns) {
      this.game = game();
      turnsToCatchUp = turns;
    } else {
      turnsToCatchUp = turns.slice(turns.length - 1);
    }
    turnsToCatchUp.forEach(turn => {
      if (turn.isPass) {
        this.game.pass();
      } else {
        const catchUpPlacement = {
          piece: turn.piece,
          flipped: turn.flipped,
          rotations: turn.rotations,
          position: turn.position
        };
        this.game.place(catchUpPlacement);
      }
    });
  }

  placeSelectedPiece = (position) => {
    const currentPlayer = this.state.currentPlayer;
    const clientPlayer = this.state.clientPlayer;
    if (currentPlayer && clientPlayer && (currentPlayer.id === clientPlayer.id)) {
      if (this.state.selectedPiece) {
        const placement = {
          piece: this.state.selectedPiece.id,
          flipped: this.state.selectedFlipped,
          rotations: this.state.selectedRotations,
          position
        };
        const placementResult = this.game.place(placement);
        if (placementResult.success) {
          socket.emit('take:turn', { turns: this.game.turns() });
          this.updateStateAfterTurn();
          this.hoverPosition(false, position);
        }
      }
    }
  }
  passTurn = () => {
    const currentPlayer = this.state.currentPlayer;
    const clientPlayer = this.state.clientPlayer;
    if (currentPlayer && clientPlayer && currentPlayer.id === clientPlayer.id) {
      const passResult = this.game.pass();
      if (passResult.success) {
        socket.emit('take:turn', { turns: this.game.turns() });
        this.updateStateAfterTurn();
      }
    }
  }
  hoverPosition = (showHover, position) => {
    if (!this.game.isOver()) {
      if (this.state.selectedPiece && this.state.clientPlayer) {
        if (showHover) {
          const probeResult = this.game.place({
            player: this.state.clientPlayer.id,
            piece: this.state.selectedPiece.id,
            flipped: this.state.selectedFlipped,
            rotations: this.state.selectedRotations,
            position,
            probe: true
          });
          this.setState({ highlightedPositions: probeResult.positions });
        } else {
          this.setState({ highlightedPositions: [] })
        }
      }
    }
  }
  setSelectedPiece = piece => {
    this.setState({ selectedPiece: piece, selectedFlipped: false, selectedRotations: 0 });
  }
  setSelectedFlipped = flipped => {
    this.setState({ selectedFlipped: flipped });
  }
  setSelectedRotations = rotations => {
    this.setState({ selectedRotations: rotations });
  }
  render() {
    const clientPlayer = this.state.clientPlayer;
    const clientPlayerId = clientPlayer ? clientPlayer.id : null;
    const isOver = this.game.isOver();
    const players = this.game.players().map(player => {
      return {
        ...player,
        score: this.game.numRemaining({ player: player.id }),
        pieces: player ? this.game.availablePieces({ player: player.id }) : []
      };
    });
    const pieceLists = !isOver ?
      players.filter(player => player.id !== clientPlayerId)
      .map(player => {
        return (
          <PieceList pieces={player.pieces}
                      isHuman={this.state.playerList.includes(player.id)}
                      player={player}
                      currentPlayer={this.state.currentPlayer}
                      isOver={isOver}
                      score={player.score}
                      key={player.id}
                    />
        );
      }) : players.map(player => {
        return (
          <PieceList pieces={player.pieces}
                      isHuman={this.state.playerList.includes(player.id)}
                      player={player}
                      currentPlayer={this.state.currentPlayer}
                      isOver={isOver}
                      score={player.score}
                      key={player.id}
                    />
        );
      });

    const clientPlayerPieces = clientPlayerId !== null ? players.find(player => player.id === clientPlayer.id).pieces : [];
    const clientPlayerScore = clientPlayerId !== null ? this.game.numRemaining({ player: clientPlayerId }) : 0;

    const otherPlayerPieceViewClasses = isOver ? 'other-player-pieces is-over' : 'other-player-pieces';
    const gameView = (
      <div className="blokus-container">
          <div className={otherPlayerPieceViewClasses}>
            {pieceLists}
          </div>
          <Board board={this.state.board}
            placeSelectedPiece={this.placeSelectedPiece}
            highlightedPositions={this.state.highlightedPositions}
            hoverPosition={this.hoverPosition}
            isMainBoard={true}
            clientPlayer={this.state.clientPlayer}
          />
        {!isOver ?
          <div className="piece-control-container">
            <PieceList pieces={clientPlayerPieces}
              isClientPlayer={true}
              score={clientPlayerScore}
              selectedPiece={this.state.selectedPiece}
              setSelectedPiece={this.setSelectedPiece}
              player={this.state.clientPlayer}
              currentPlayer={this.state.currentPlayer}
              isOver={isOver}
            />
            {this.state.selectedPiece &&
              <div className="piece-control-display-container">
                <div className="piece-control-display">
                  <Piece piece={this.state.selectedPiece}
                         flipped={this.state.selectedFlipped}
                         rotations={this.state.selectedRotations} />
                </div>
                <div className="piece-control-buttons">
                  <PieceTransform
                    flipped={this.state.selectedFlipped}
                    rotations={this.state.selectedRotations}
                    setSelectedFlipped={this.setSelectedFlipped}
                    setSelectedRotations={this.setSelectedRotations}
                />
                <PassButton passTurn={this.passTurn} />
                </div>
              </div>
            }
        </div> :
        <GameOver
          players={players}
        />
        }
      </div>
    );
    return this.state.joined ? gameView : <div></div>;
  }
}
