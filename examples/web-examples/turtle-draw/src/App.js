import React from 'react';
import TurtleCanvas from './TurtleCanvas';
import EventEmitter from "events";
const events = new EventEmitter();

function App() {
  return (
    <div className="App">
      <TurtleCanvas events={events} />
    </div>
  );
}

export default App;
