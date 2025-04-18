//historyPage

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaList, FaComment, FaCheckCircle, FaTrash, FaHistory, FaArrowLeft, FaSun, FaMoon } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function HistoryPage({ theme, toggleTheme, history, setHistory }) {
  const navigate = useNavigate();

  const deleteHistoryEntry = (id) => {
    setHistory((prevHistory) => prevHistory.filter((entry) => entry.id !== id));
    toast.info('Analyse supprimée de l’historique.');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
    toast.info('Historique vidé.');
  };

  return (
    <div className={`App ${theme}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="app-header">
        <h1>Historique des Analyses</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/')} className="back-button">
            <FaArrowLeft />
            <span>Retour</span>
          </button>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}</span>
          </button>
        </div>
      </header>
      <div className="container">
        <div className="history-section">
          {history.length === 0 ? (
            <p>Aucune analyse dans l’historique.</p>
          ) : (
            <>
              <button onClick={clearHistory} className="reset-button clear-history-button">
                <FaTrash className="button-icon" />
                Vider l’historique
              </button>
              {history.map((entry) => (
                <div key={entry.id} className="history-card">
                  <div className="history-content">
                    {entry.imageBase64 && (
                      <div className="history-image-preview">
                        <img src={entry.imageBase64} alt="Aperçu de l'image analysée" />
                      </div>
                    )}
                    {entry.detected_objects ? (
                      <>
                        <div className="history-item">
                          <FaList className="result-icon" />
                          <div className="result-content">
                            <strong>Objets détectés</strong>
                            <span>{entry.detected_objects.join(', ')}</span>
                          </div>
                        </div>
                        <div className="history-item">
                          <FaComment className="result-icon" />
                          <div className="result-content">
                            <strong>Description</strong>
                            <span>{entry.description}</span>
                          </div>
                        </div>
                        <div className="history-item">
                          <FaCheckCircle className="result-icon" />
                          <div className="result-content">
                            <strong>Score de confiance</strong>
                            <span>{(entry.confidence * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="history-item">
                        <div className="result-content">
                          <strong>Statut</strong>
                          <span>Image uploadée, mais non analysée.</span>
                        </div>
                      </div>
                    )}
                    <div className="history-item">
                      <FaHistory className="result-icon" />
                      <div className="result-content">
                        <strong>Date</strong>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHistoryEntry(entry.id)}
                    className="delete-button"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;