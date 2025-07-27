import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Product.css';
import API_BASE_URL from '../../config/apiConfig';

function Product() {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setGenerating(true);
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
        params: { query, gender }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setGenerating(false);
      }, 1000);
    }
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="container">
      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-popup">
            <h3>Important Information</h3>
            <p>The images are produced by generative AI algorithms. Faulty responses may occur. To get the best results, refine your prompt with efficient terminology.</p>
            <button onClick={handleAcceptDisclaimer} className="disclaimer-accept-button">Accept</button>
          </div>
        </div>
      )}

      <h1>Fashion Designs - Generative AI Search</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the clothing you're looking for..."
          required
          disabled={generating || showDisclaimer}
        />
        <select 
          value={gender} 
          onChange={(e) => setGender(e.target.value)}
          disabled={generating || showDisclaimer}
        >
          <option value="">Any Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit" disabled={generating || showDisclaimer}>
          {generating ? (
            <>
              <span className="spinner"></span> Searching...
            </>
          ) : (
            'Generate'
          )}
        </button>
      </form>

      {loading && (
        <div className="loading">
          Analyzing fashion database...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          {results.map((product, index) => (
            <div key={product.id || index} className="product-card">
              <img 
                src={product.imageUrl} 
                alt={product.displayName} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Available';
                }}
              />
              <div className="product-info">
                <h3>{product.displayName}</h3>
                <p className="category">{product.category}</p>
                <p className="description">
                  {product.description?.substring(0, 150)}
                  {product.description?.length > 150 ? '...' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query && !showDisclaimer && (
        <div className="no-results">
          <p>No products found. Try adjusting your search terms.</p>
        </div>
      )}

      <footer className="footer">
        <div></div>
        <div>Enhancing Fashion Market using Virtual Fashion Studio Powered by AI &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}

export default Product;