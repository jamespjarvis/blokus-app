import React from 'react';

import { Row } from './Row';

export function Board(props) {
  const rowList = props.board.map((row, rowIdx) => {
    return (
      <Row players={props.players}
          row={row}
          rowIdx={rowIdx}
          isMainBoard={props.isMainBoard}
          highlightedPositions={props.highlightedPositions}
          placeSelectedPiece={props.placeSelectedPiece}
          hoverPosition={props.hoverPosition}
          clientPlayer={props.clientPlayer}
          key={rowIdx}
        />
    );
  });
  return (
    <div className="board-container">
      {rowList}
    </div>
  )
}
