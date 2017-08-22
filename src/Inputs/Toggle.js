import React, { Component } from 'react';
import './Toggle.css';

export class Toggle extends Component {
  render() {
    return (
      <label className="switch">
        <input type="checkbox" value={this.props.isChecked} onChange={this.props.updatePlayerHuman} />
        <div className="slider"></div>
      </label>
    )
  }
}
