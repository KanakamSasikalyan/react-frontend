import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GenerateDesign.css';

const API_BASE_URL = '';

const GenerateDesign = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('casual');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/designs/${encodeURIComponent(prompt)}?style=${style}`
      );
      const imageUrl = URL.createObjectURL(
        new Blob([response.data], { type: 'image/png' })
      );
      navigate('/', { state: { generatedImage: imageUrl } });
    } catch (error) {
      console.error('Error generating design:', error);
    } finally {
      setIsLoading(false);
    }
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
          />
        </div>
        <div className="form-group">
          <label>Select style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
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
          >
            {'<--'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateDesign;