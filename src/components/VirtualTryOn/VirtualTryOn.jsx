import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VirtualTryOn.css';
import API_BASE_URL from '../../config/apiConfig';

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState({
    cloth: false,
    processing: false
  });
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Upload, 2: Result
  const location = useLocation();
  const navigate = useNavigate();

  // Load pre-processed cloth image if coming from marketplace
  useEffect(() => {
    if (location.state?.clothImageUrl) {
      const loadClothImage = async () => {
        try {
          setLoading(prev => ({ ...prev, cloth: true }));
          setError(null);
          
          const response = await fetch(location.state.clothImageUrl);
          if (!response.ok) throw new Error('Failed to load clothing image');
          
          const blob = await response.blob();
          const file = new File([blob], 'processed-clothing.png', { type: blob.type });
          setClothImage(file);
          setStep(1); // Move to upload step
        } catch (err) {
          console.error('Error loading cloth image:', err);
          setError(err.message);
        } finally {
          setLoading(prev => ({ ...prev, cloth: false }));
        }
      };

      loadClothImage();
    }
  }, [location.state]);

  const handleUserImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size must be less than 5MB');
      return;
    }

    setUserImage(file);
    setError(null);
  };

  const handleClothImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    setClothImage(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!userImage) {
      setError('Please upload your photo');
      return;
    }

    if (!clothImage) {
      setError('Please upload or select a clothing image');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, processing: true }));
      setError(null);

      const formData = new FormData();
      formData.append('userImage', userImage);
      formData.append('clothImage', clothImage);

      const response = await axios.post(
        `${API_BASE_URL}/api/virtual-tryon/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 60000 // 60 seconds timeout
        }
      );

      if (!response.data.resultUrl) {
        throw new Error('No result image received');
      }

      setResultImage(response.data.resultUrl);
      setStep(2); // Move to result step
    } catch (err) {
      console.error('Try-on failed:', err);
      setError(err.response?.data?.message || err.message || 'Try-on generation failed');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setClothImage(null);
    setResultImage(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="virtual-tryon-page">
      <header className="tryon-header">
        <h1>Virtual Try-On</h1>
        <button 
          className="back-btn"
          onClick={() => navigate('/marketplace')}
        >
          ← Back to Marketplace
        </button>
      </header>

      {error && (
        <div className="tryon-alert error">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {loading.cloth && (
        <div className="loading-overlay">
          <div className="spinner large"></div>
          <p>Loading your selected clothing...</p>
        </div>
      )}

      {step === 1 ? (
        <div className="tryon-container">
          <div className="upload-section">
            <div className="upload-box">
              <h3>1. Upload Your Photo</h3>
              <div className={`upload-area ${userImage ? 'has-image' : ''}`}>
                {userImage ? (
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(userImage)} 
                      alt="Your photo" 
                    />
                    <button 
                      className="change-btn"
                      onClick={() => setUserImage(null)}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="userImage"
                      accept="image/*"
                      onChange={handleUserImageChange}
                      disabled={loading.processing}
                    />
                    <label htmlFor="userImage">
                      <div className="upload-icon">📷</div>
                      <p>Click to upload your photo</p>
                      <p className="hint">JPG or PNG, max 5MB</p>
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="upload-box">
              <h3>2. Clothing Image</h3>
              <div className={`upload-area ${clothImage ? 'has-image' : ''}`}>
                {clothImage ? (
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(clothImage)} 
                      alt="Clothing" 
                    />
                    <button 
                      className="change-btn"
                      onClick={() => setClothImage(null)}
                    >
                      Change Clothing
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="clothImage"
                      accept="image/*"
                      onChange={handleClothImageChange}
                      disabled={loading.processing}
                    />
                    <label htmlFor="clothImage">
                      <div className="upload-icon">👕</div>
                      <p>
                        {location.state?.clothImageUrl 
                          ? 'Processing your selection...' 
                          : 'Click to upload clothing image'}
                      </p>
                      <p className="hint">JPG or PNG, max 5MB</p>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleSubmit}
              disabled={!userImage || !clothImage || loading.processing}
              className="primary-btn"
            >
              {loading.processing ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                'Generate Virtual Try-On'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="result-container">
          <h2>Your Virtual Try-On Result</h2>
          
          <div className="result-image-container">
            <img 
              src={resultImage} 
              alt="Virtual try-on result" 
              className="result-image"
              onError={() => setError('Failed to load result image')}
            />
          </div>

          <div className="result-actions">
            <a
              href={resultImage}
              download={`virtual-tryon-${new Date().getTime()}.png`}
              className="download-btn"
            >
              Download Image
            </a>
            <button
              onClick={handleReset}
              className="secondary-btn"
            >
              Try Another Combination
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTryOn;