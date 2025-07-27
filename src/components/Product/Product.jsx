import React, { useState } from 'react';
import axios from 'axios';
import './Product.css';
import API_BASE_URL from '../../config/apiConfig';

function Product() {
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setGenerating(true);
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
        params: { query, gender }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setGenerating(false);
      }, 1000); // Minimum 1 second delay even if search is faster
    }
  };

  return (
    <div className="container">
      <h1>Fashion Image Search</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the clothing you're looking for..."
          required
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Any Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit" disabled={generating}>
          {generating ? (
            <>
              <span className="spinner"></span> Generating...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {loading && <div className="loading">Analyzing fashion database...</div>}

      <div className="results">
        {results.map((product) => (
          <div key={product.id} className="product-card">
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
              <p className="description">{product.description.substring(0, 150)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Product;