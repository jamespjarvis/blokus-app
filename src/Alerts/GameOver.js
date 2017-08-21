import React from 'react';

export function GameOver(props) {
  const players = props.players.sort((a, b) => a.score > b.score);
  const winner = `Player ${players[0].id + 1} Wins!`;
  const playerScores = players.map((player, index) => {
    return (
      <div className="score">
        {index + 1}. {player.score} pts - Player {player.id + 1}
      </div>
    );
  });

  return (
    <div className="game-over">
      <div className="message">
        <div>
          {winner}
        </div>
        <div>
          The game is over!
        </div>
      </div>
      <div className="player-scores">
        {playerScores}
      </div>
    </div>
  );
}
