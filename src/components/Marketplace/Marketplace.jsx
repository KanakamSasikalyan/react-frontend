import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Marketplace.css';
import API_BASE_URL from '../../config/apiConfig';

const Marketplace = () => {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/designs/all`);
        const designData = await response.json();
        setDesigns(designData);
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter((design) => {
    const matchesStyle = filter === 'all' || (design.style && design.style.toLowerCase() === filter.toLowerCase());
    const matchesGender = genderFilter === 'all' || (design.gender && design.gender.toLowerCase() === genderFilter.toLowerCase());
    const matchesSearch = 
      searchTerm.trim() === '' ||
      (design.prompt && design.prompt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStyle && matchesGender && matchesSearch;
  });

  return (
    <div className="marketplace-container">
      <h2>Design Marketplace</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search designs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="select-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Styles</option>
            <option value="casual">Casual</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="formal">Formal</option>
            <option value="sporty">Sporty</option>
            <option value="party">Party</option>
            <option value="ethnic">Ethnic</option>
            <option value="fusion">Fusion</option>
            <option value="streetwear">Streetwear</option>
            <option value="business">Business</option>
            <option value="traditional">Traditional</option>
            <option value="other">Other</option>
          </select>
          <select 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading designs...</div>
      ) : (
        <div className="design-grid">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map((design) => (
              <div key={design.id} className="design-card">
                <img 
                  src={design.imageUrl} 
                  alt={design.prompt || 'Fashion design'} 
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />
                <div className="design-info">
                  <h3>{design.prompt || 'Untitled Design'}</h3>
                  <div className="tags">
                    <span className={`style-tag ${design.style || 'other'}`}>
                      {design.style || 'other'}
                    </span>
                    <span className={`gender-tag ${design.gender || 'unisex'}`}>
                      {design.gender || 'unisex'}
                    </span>
                  </div>
                  <Link to={`/try-on?designId=${design.id}`} className="try-on-button">
                    Try On
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No designs found matching your criteria</p>
              <button onClick={() => {
                setFilter('all');
                setGenderFilter('all');
                setSearchTerm('');
              }}>
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