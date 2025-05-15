import React, { useState } from 'react';
import axios from 'axios';
import './OutfitSuggestion.css';
import API_BASE_URL from '../../config/apiConfig';

const OutfitSuggestion = () => {
  const [occasion, setOccasion] = useState('');
  const [gender, setGender] = useState('unisex');
  const [customPrompt, setCustomPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const occasions = [
    'Wedding',
    'Business Meeting',
    'Beach',
    'Hiking',
    'Office',
    'Shopping',
    'Interview',
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const query = customPrompt || occasion;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/outfit/suggest?occasion=${encodeURIComponent(query)}&gender=${encodeURIComponent(gender)}`
      );
      setSuggestion(response.data);
    } catch (error) {
      console.error('Error fetching outfit suggestion:', error);
      setSuggestion('Failed to fetch suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="outfit-suggestion-container">
      <h2>Outfit Suggestion</h2>
      <form onSubmit={handleSubmit} className="outfit-form">
        <div className="form-group">
          <label>Select an Occasion</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            disabled={!!customPrompt}
          >
            <option value="">-- Select Occasion --</option>
            {occasions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
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

        <button type="submit" disabled={isLoading || (!occasion && !customPrompt)}>
          {isLoading ? 'Loading...' : 'Get Suggestion'}
        </button>
      </form>

      {suggestion && (
        <div className="suggestion-result">
          <h3>Suggested Outfit:</h3>
          <p>{suggestion}</p>
        </div>
      )}
    </div>
  );
};

export default OutfitSuggestion;