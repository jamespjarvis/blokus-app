import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './App.css';
import { Blokus } from './Blokus';
import { GameSelection } from './Routes/GameSelection';


class App extends Component {
  render() {
    return (
      <div className="app-container">
        <Router>
          <div>
            <div className="content-container">
              <Route exact path="/" component={GameSelection} />
              <Route path="/:gameId" component={Blokus} />
            </div>
          </div>
        </Router>
      </div>
    );
  }
}
export default App;
