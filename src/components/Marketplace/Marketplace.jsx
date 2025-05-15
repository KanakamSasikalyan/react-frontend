import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Marketplace.css';
import API_BASE_URL from '../../config/apiConfig';

const Marketplace = () => {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/api/designs/all`);
        setDesigns(response.data);
      } catch (err) {
        console.error('Failed to load designs:', err);
        setError('Failed to load designs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const handleTryOn = async (designId, imageUrl) => {
    try {
      setProcessingId(designId);
      setError(null);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/image/remove-background`,
        { imageUrl },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.data.processedImageUrl) {
        throw new Error('No processed image URL received');
      }

      navigate('/try-on', {
        state: {
          clothImageUrl: response.data.processedImageUrl,
          designId: designId
        }
      });
    } catch (err) {
      console.error('Background removal failed:', err);
      setError(err.response?.data?.message || err.message || 'Background removal failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDesigns = designs.filter(design => {
    const matchesStyle = filter === 'all' || 
      (design.style && design.style.toLowerCase() === filter.toLowerCase());
    const matchesGender = genderFilter === 'all' || 
      (design.gender && design.gender.toLowerCase() === genderFilter.toLowerCase());
    const matchesSearch = searchTerm.trim() === '' ||
      (design.prompt && design.prompt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStyle && matchesGender && matchesSearch;
  });

  return (
    <div className="marketplace-container">
      <h2>Design Marketplace</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <i className="search-icon">🔍</i>
        </div>

        <div className="dropdown-filters">
          <div className="filter-group">
            <label>Style:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Styles</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
              {/* Add other style options */}
            </select>
          </div>

          <div className="filter-group">
            <label>Gender:</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading designs...</p>
        </div>
      ) : (
        <div className="designs-grid">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map(design => (
              <div key={design.id} className="design-card">
                <div className="image-container">
                  <img 
                    src={design.imageUrl} 
                    alt={design.prompt || 'Fashion design'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  {processingId === design.id && (
                    <div className="processing-overlay">
                      <div className="spinner small"></div>
                      <span>Removing background...</span>
                    </div>
                  )}
                </div>

                <div className="design-details">
                  <h3>{design.prompt || 'Untitled Design'}</h3>
                  <div className="tags">
                    <span className={`tag style ${design.style || 'other'}`}>
                      {design.style || 'other'}
                    </span>
                    <span className={`tag gender ${design.gender || 'unisex'}`}>
                      {design.gender || 'unisex'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTryOn(design.id, design.imageUrl)}
                    className="try-on-btn"
                    disabled={processingId !== null}
                  >
                    {processingId === design.id ? 'Processing...' : 'Virtual Try-On'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <img src="/images/no-results.svg" alt="No designs found" />
              <h3>No designs match your search</h3>
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setFilter('all');
                  setGenderFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;