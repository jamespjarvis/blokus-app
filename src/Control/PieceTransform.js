import React, { Component } from 'react';

export class PieceTransform extends Component {
  toggleFlipped = () => {
    const newFlipped = !this.props.flipped;
    this.props.setSelectedFlipped(newFlipped);

    if (this.props.rotation % 2 === 1) {
      const newRotations = (this.props.rotations + 2) % 4;
      this.props.setSelectedRotations(newRotations);
    }
  }
  incrementRotations = () => {
    const newRotations = (this.props.rotations + 1) % 4;
    this.props.setSelectedRotations(newRotations);
  }
  render() {
    return (
      <div className="piece-transform-container">
        <div className="piece-transform-button">
          <button onClick={this.toggleFlipped}>
            ⇋
          </button>
        </div>
        <div className="piece-transform-button">
             <button onClick={this.incrementRotations}>
               ↻
             </button>
        </div>
      </div>
    )
  }
}
