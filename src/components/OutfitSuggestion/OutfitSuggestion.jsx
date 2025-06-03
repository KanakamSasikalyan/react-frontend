import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OutfitSuggestion.css';
import API_BASE_URL from '../../config/apiConfig';

const OutfitSuggestion = () => {
  const [occasion, setOccasion] = useState('');
  const [gender, setGender] = useState('unisex');
  const [season, setSeason] = useState('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const occasions = [
    'Wedding',
    'Business Meeting',
    'Beach',
    'Hiking',
    'Office',
    'Shopping',
    'Interview',
    'Date Night',
    'Gym',
    'Party'
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const seasons = [
    { value: 'all', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const query = customPrompt || occasion;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/outfit/suggest?occasion=${encodeURIComponent(query)}&gender=${encodeURIComponent(gender)}&season=${encodeURIComponent(season)}`
      );
      setSuggestion(response.data);
      
      // Parse the response if it contains alternatives
      if (typeof response.data === 'string' && response.data.includes('Main suggestion:')) {
        const mainMatch = response.data.match(/Main suggestion: (.*?)(\n|$)/);
        const altMatch = response.data.match(/Alternative options:\n([\s\S]*)/);
        
        if (mainMatch) setSuggestion(mainMatch[1]);
        if (altMatch) {
          const altLines = altMatch[1].split('\n').filter(line => line.trim());
          setAlternatives(altLines.map(line => line.replace(/^- /, '').trim()));
        }
      } else {
        setAlternatives([]);
      }
    } catch (error) {
      console.error('Error fetching outfit suggestion:', error);
      setSuggestion('Failed to fetch suggestion. Please try again.');
      setAlternatives([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="outfit-suggestion-container">
      <h2>OUTFIT RECOMMENDER</h2>
      <form onSubmit={handleSubmit} className="outfit-form">
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Select an Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              disabled={!!customPrompt}
            >
              <option value="">Select Occasion</option>
              {occasions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              {seasons.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Or Enter a Custom Prompt</label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Casual dinner with friends"
            disabled={!!occasion}
          />
        </div>

        <div className="form-group">
          <label>Select Gender</label>
          <div className="gender-options">
            {genders.map((option) => (
              <label key={option.value} className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={gender === option.value}
                  onChange={() => setGender(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="button-group-outfit">
          <button 
            type="submit" 
            className="submit-button-outfit"
            disabled={isLoading || (!occasion && !customPrompt)}
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50" width="20" height="20">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5"></circle>
                </svg>
                Loading...
              </>
            ) : 'Get Suggestion'}
          </button>
          <button 
            type="button" 
            className="back-button-outfit"
            onClick={() => navigate(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
      </form>

      {suggestion && (
        <div className="suggestion-result">
          <h3>Suggested Outfit</h3>
          <div className="main-suggestion">
            {suggestion}
          </div>
          
          {alternatives.length > 0 && (
            <>
              <h4>Alternative Options</h4>
              <ul className="alternative-list">
                {alternatives.map((alt, index) => (
                  <li key={index}>{alt}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI</p>
      </footer>
    </div>
  );
};

export default OutfitSuggestion;