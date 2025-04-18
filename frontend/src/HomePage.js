// homePage
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaSearch, FaSpinner, FaRedo, FaComment, FaSun, FaMoon, FaHistory } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function HomePage({ theme, toggleTheme, addToHistory }) {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setAnalysisResult(null);
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyzeAndUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }
  
    setLoading(true);
    setProgress(10);
  
    try {
      // 1. Créer le FormData avec la photo
      const formData = new FormData();
      formData.append('photo', file);
  
      // 2. Envoyer à l'API unique /photo-analyze-upload/
      const response = await fetch('http://127.0.0.1:8000/photo-analyze-upload/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error("Erreur lors de l’analyse et de l’enregistrement");
  
      const data = await response.json();
  
      const analysisData = {
        description: data.description,
      };
  
      const imageObjectURL = URL.createObjectURL(file);
  
      setAnalysisResult(analysisData);
      setProgress(100);
      toast.success('Analyse et enregistrement réussis !');
  
      // 3. Ajout à l'historique
      addToHistory((prevHistory) => [
        ...prevHistory,
        {
          id: data.photo_id,
          imageBase64: imageObjectURL,
          description: data.description,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };
  

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setLoading(false);
    setProgress(0);
    toast.info('Interface réinitialisée.');
  };

  return (
    <div className={`App ${theme}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="app-header">
        <h1>Analyse d’Images avec IA</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/history')} className="history-toggle">
            <FaHistory />
            <span>Voir l’historique</span>
          </button>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
            <span>{theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}</span>
          </button>
        </div>
      </header>

      <div className="container">
        <div className="upload-section">
          <h2>Sélectionner une Image</h2>
          <label className="file-input-label">
            <FaUpload className="icon" />
            <span>{file ? file.name : 'Choisir une image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Prévisualisation" />
            </div>
          )}
        </div>

        {file && (
          <div className="analyze-section">
            <div className="button-group">
              <button onClick={handleAnalyzeAndUpload} disabled={loading} className="analyze-button">
                <FaSearch className="button-icon" />
                {loading ? 'Analyse en cours...' : 'Analyser l’image'}
              </button>
              <button onClick={handleReset} className="reset-button">
                <FaRedo className="button-icon" />
                Réinitialiser
              </button>
            </div>
            {loading && (
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="loading">
            <FaSpinner className="spinner" />
            <span>Chargement...</span>
          </div>
        )}

        {analysisResult && !loading && (
          <div className="results">
            <h2>Résultats de l’Analyse</h2>
            <div className="result-card">
              <FaComment className="result-icon" />
              <div className="result-content">
                <span>{analysisResult.description}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
