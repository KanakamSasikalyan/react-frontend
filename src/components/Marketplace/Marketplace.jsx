import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
          },
          responseType: 'blob'
        }
      );
  
      if (!response.data) {
        throw new Error('No processed image received');
      }
  
      const processedFile = new File([response.data], 'processed-clothing.png', { 
        type: 'image/png' 
      });
  
      navigate('/cam-try-on', {
        state: {
          processedClothFile: processedFile,
          designId: designId
        }
      });
    } catch (err) {
      console.error('Background removal failed:', err);
      setError(err.response?.data?.error || err.message || 'Background removal failed');
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
    <div className="marketplace-container-mp">
      <div className="marketplace-header-mp">
        <h2>Design Marketplace</h2>
        <button className="back-to-dashboard-mp" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </button>
      </div>
      
      {error && (
        <div className="alert-error-mp">
          {error}
          <button onClick={() => setError(null)} className="close-btn-mp">×</button>
        </div>
      )}

      <div className="filters-container-mp">
        <div className="search-box-mp">
          <input
            type="text"
            placeholder="Search designs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-mp"
          />
          <svg className="search-icon-mp" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="dropdown-filters-mp">
          <div className="filter-group-mp">
            <label>Style:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select-mp"
            >
              <option value="all">All Styles</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
              <option value="vintage">Vintage</option>
            </select>
          </div>

          <div className="filter-group-mp">
            <label>Gender:</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="filter-select-mp"
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
        <div className="loading-spinner-mp">
          <div className="spinner-mp"></div>
          <p>Loading designs...</p>
        </div>
      ) : (
        <div className="designs-grid-mp">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map(design => (
              <div key={design.id} className="design-card-mp">
                <div className="image-container-mp">
                  <img 
                    src={design.imageUrl} 
                    alt={design.prompt || 'Fashion design'}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  {processingId === design.id && (
                    <div className="processing-overlay-mp">
                      <div className="spinner-mp small"></div>
                      <span>Removing background...</span>
                    </div>
                  )}
                </div>

                <div className="design-details-mp">
                  <h3>{design.prompt || 'Untitled Design'}</h3>
                  <div className="tags-mp">
                    <span className={`tag-mp style ${design.style || 'other'}`}>
                      {design.style || 'other'}
                    </span>
                    <span className={`tag-mp gender ${design.gender || 'unisex'}`}>
                      {design.gender || 'unisex'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTryOn(design.id, design.imageUrl)}
                    className="try-on-btn-mp"
                    disabled={processingId !== null}
                  >
                    {processingId === design.id ? 'Processing...' : 'Camera Try-On'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-mp">
              <img src="/images/no-results.svg" alt="No designs found" />
              <h3>No designs match your search</h3>
              <button 
                className="clear-filters-btn-mp"
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

      <footer className="marketplace-footer-mp">
        &copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI, <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub Dev</a>
      </footer>
    </div>
  );
};

export default Marketplace;