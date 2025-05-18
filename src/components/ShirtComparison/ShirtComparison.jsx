import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ShirtComparison.css';
import API_BASE_URL from '../../config/apiConfig';

const ShirtComparison = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [platform1, setPlatform1] = useState('');
  const [platform2, setPlatform2] = useState('');
  const [price1, setPrice1] = useState('');
  const [price2, setPrice2] = useState('');
  const [description1, setDescription1] = useState('');
  const [description2, setDescription2] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const platforms = ['Amazon', 'Myntra', 'Flipkart', 'Snapdeal', 'Nyka', 'Ajio'];

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    if (image1) formData.append('image1', image1);
    if (platform1) formData.append('platform1', platform1);
    if (price1) formData.append('price1', price1);
    if (description1) formData.append('description1', description1);
    if (image2) formData.append('image2', image2);
    if (platform2) formData.append('platform2', platform2);
    if (price2) formData.append('price2', price2);
    if (description2) formData.append('description2', description2);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/shirts/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error comparing shirts:', error);
      setResult({ status: 'error', message: error.response?.data?.message || 'Failed to compare shirts. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shirt-comparison-container">
      <h2>TOP CHOICE</h2>
      <form onSubmit={handleSubmit} className="shirt-comparison-form">
        <div className="side-by-side">
          <div className="form-group">
            <label>Upload Image 1</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage1, setPreview1)} />
            {preview1 && <img src={preview1} alt="Preview 1" className="image-preview" />}
            <label>Platform 1</label>
            <select value={platform1} onChange={(e) => setPlatform1(e.target.value)}>
              <option value="">-- Select Platform --</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
            <label>Price 1</label>
            <input type="number" step="0.01" value={price1} onChange={(e) => setPrice1(e.target.value)} />
            <label>Description 1</label>
            <textarea value={description1} onChange={(e) => setDescription1(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Upload Image 2</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage2, setPreview2)} />
            {preview2 && <img src={preview2} alt="Preview 2" className="image-preview" />}
            <label>Platform 2</label>
            <select value={platform2} onChange={(e) => setPlatform2(e.target.value)}>
              <option value="">-- Select Platform --</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
            <label>Price 2</label>
            <input type="number" step="0.01" value={price2} onChange={(e) => setPrice2(e.target.value)} />
            <label>Description 2</label>
            <textarea value={description2} onChange={(e) => setDescription2(e.target.value)} />
          </div>
        </div>

        <div className="button-group-opt">
          <button 
            type="submit" 
            className="compare-button"
            disabled={isLoading}
          >
            {isLoading ? 'Comparing...' : 'Compare Shirts'}
          </button>
          <button 
            type="button" 
            className="back-button-opt"
            onClick={() => navigate(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
      </form>

      {result && (
        <div className="comparison-result">
          <h3>TOP RECOMMENDATION</h3>
          {result.status === 'error' ? (
            <div className="error-message">{result.message}</div>
          ) : result.recommendation ? (
            <div className="result-item">
              <img src={result.recommendation.id === 'shirt_1' ? preview1 : preview2} 
                   alt="Recommended Shirt" 
                   className="result-image" />
              <div className="result-summary">
                <p><strong>Platform:</strong> {result.recommendation.platform}</p>
                <p><strong>Price:</strong> {result.recommendation.price}</p>
                <p><strong>Material:</strong> {result.recommendation.material}</p>
                <p><strong>Reason:</strong> {result.recommendation.reason}</p>
              </div>
            </div>
          ) : (
            <div>No recommendation available</div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI</p>
      </footer>
    </div>
  );
};

export default ShirtComparison;