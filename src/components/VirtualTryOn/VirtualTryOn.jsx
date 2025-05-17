import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VirtualTryOn.css';
import API_BASE_URL from '../../config/apiConfig';

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUserImageChange = (e) => {
    setUserImage(e.target.files[0]);
  };

  const handleClothImageChange = (e) => {
    setClothImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!userImage || !clothImage) {
      alert('Please select both user and cloth images.');
      return;
    }

    const formData = new FormData();
    formData.append('userImage', userImage);
    formData.append('clothImage', clothImage);

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/virtual-tryon/try-on`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultImage(response.data);
    } catch (error) {
      console.error('Error submitting images:', error);
      alert('Failed to process the images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="try-on-page">
      <h1 className="page-header">
          DIGITAL FITTING
      </h1>
      
      <div className="try-on-container">
        <div className="input-section">
          <div className="file-input">
            <label htmlFor="userImage">Upload User Image:</label>
            <input type="file" id="userImage" accept="image/*" onChange={handleUserImageChange} />
            {userImage && (
              <div className="preview-box">
                <img src={URL.createObjectURL(userImage)} alt="User Preview" />
              </div>
            )}
          </div>

          <div className="file-input">
            <label htmlFor="clothImage">Upload Cloth Image:</label>
            <input type="file" id="clothImage" accept="image/*" onChange={handleClothImageChange} />
            {clothImage && (
              <div className="preview-box">
                <img src={URL.createObjectURL(clothImage)} alt="Cloth Preview" />
              </div>
            )}
          </div>
        </div>

        <div className="button-group">
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Generate Try-On'}
          </button>
          <button 
            className="back-button-vton" 
            onClick={() => navigate(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
      </div>

      {resultImage && (
        <div className="result-section">
          <h3>Your Virtual Try-On Result</h3>
          <img src={resultImage} alt="Virtual Try-On Result" className="result-image" />
          <a href={resultImage} download="virtual-try-on-result.png" className="download-button">
            Download Image
          </a>
        </div>
      )}

      <footer className="footer">
        &copy; {new Date().getFullYear()} Metaverse Fashion Studio. All rights reserved.
      </footer>
    </div>
  );
};

export default VirtualTryOn;