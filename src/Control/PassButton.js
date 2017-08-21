import React, { Component } from 'react';

export class PassButton extends Component {
  render() {
    return (
      <div className="pass-button"
        onClick={this.props.passTurn}>
        <button>
          Pass
        </button>
      </div>
    )
  }
}
