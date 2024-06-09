import logo from './logo.svg';
import { findNearby } from './script.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
          Hello world!
          <button onClick={findNearby}>Send request</button>
      </header>
    </div>
  );
}

export default App;
