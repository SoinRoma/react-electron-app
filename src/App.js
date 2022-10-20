import './App.css';
import packageJson from '../package.json';
import './static/main.js';

function App() {
  return (
    <div className="App">
      <h1>Version {packageJson.version}</h1>
    </div>
  );
}

export default App;
