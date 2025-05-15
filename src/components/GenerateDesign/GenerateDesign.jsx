import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GenerateDesign.css';
import API_BASE_URL from '../../config/apiConfig';

const GenerateDesign = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('casual');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    setImageUrl(null);
    setError(null);
    setCurrentPrompt(prompt);

    // Use SSE for progress
    const url = `${API_BASE_URL}/api/designs/generate/stream?prompt=${encodeURIComponent(prompt)}&style=${style}`;
    const eventSource = new window.EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      if (event.data.startsWith('ERROR:')) {
        setError(event.data.replace('ERROR:', ''));
        setIsLoading(false);
        eventSource.close();
        return;
      }
      if (event.data.startsWith('PROGRESS:')) {
        const percent = parseInt(event.data.replace('PROGRESS:', ''));
        setProgress(percent);
      } else if (event.data.startsWith('COMPLETE:')) {
        setProgress(100);
        setImageUrl(event.data.replace('COMPLETE:', ''));
        setIsLoading(false);
        eventSource.close();
      }
    };
    eventSource.onerror = () => {
      setError('Connection lost or server error.');
      setIsLoading(false);
      eventSource.close();
    };
  };

  const goToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="design-form-container">
      <h2>Create Your Design</h2>
      <form onSubmit={handleSubmit} className="design-form">
        <div className="form-group">
          <label>Describe your design</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. cyberpunk jacket with neon lights"
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label>Select style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} disabled={isLoading}>
            <option value="casual">Casual</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="formal">Formal</option>
            <option value="sporty">Sporty</option>
          </select>
        </div>
        <div className="button-container">
          <button
            type="submit"
            disabled={isLoading}
            className="generate-button create-button"
          >
            {isLoading ? 'Generating...' : 'Create Design'}
          </button>
          <button
            onClick={goToDashboard}
            className="generate-button dashboard-button"
            type="button"
          >
            {'<--'}
          </button>
        </div>
      </form>
      {isLoading && (
        <div className="progress-section">
          <div className="progress-label">Generating: <b>{currentPrompt}</b></div>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-percent">{progress}%</div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {imageUrl && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="image-preview-wrapper">
            <img src={imageUrl} alt="Generated Design" className="image-preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateDesign;