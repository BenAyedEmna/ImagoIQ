import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import HomePage from './HomePage';
import HistoryPage from './HistoryPage';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    document.body.style.background = theme === 'light'
      ? 'linear-gradient(135deg, #74ebd5, #acb6e5)'
      : 'linear-gradient(135deg, #1c2526, #2c1447)';
    document.body.style.transition = 'background 0.5s ease';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    toast.info(`Mode ${theme === 'light' ? 'sombre' : 'clair'} activé.`);
  };

  const addToHistory = (entry) => {
    if (typeof entry === 'function') {
      // Si entry est une fonction, on l'utilise pour mettre à jour l'historique
      setHistory(entry);
    } else {
      // Sinon, on ajoute une nouvelle entrée
      setHistory((prevHistory) => [...prevHistory, entry]);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage theme={theme} toggleTheme={toggleTheme} addToHistory={addToHistory} />}
        />
        <Route
          path="/history"
          element={<HistoryPage theme={theme} toggleTheme={toggleTheme} history={history} setHistory={setHistory} />}
        />
      </Routes>
    </Router>
  );
}

export default App;