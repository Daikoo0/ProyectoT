import React from 'react';
import { useTheme } from './Context/theme-context';
//import './App.css'; 

const App: React.FC = () => {

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="App">
      <header className="App-header">
        <div> 
          <button onClick={toggleTheme}>Cambiar a {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</button>
        </div>
      </header>
    </div>
  );
}

export default App;
