import React from 'react';

import { Cell } from './Cell';

export function Row(props) {
  const cellList = props.row.map((playerId, colIdx) => {
    return (
      <Cell
      playerId={playerId}
      position={{ row: props.rowIdx, col: colIdx }}
      hoverPosition={props.hoverPosition}
      highlightedPositions={props.highlightedPositions}
      placeSelectedPiece={props.placeSelectedPiece}
      clientPlayer={props.clientPlayer}
      key={colIdx}
      />
    );
  });
  return (
    <div className="board-row">
      {cellList}
    </div>
  );
}
