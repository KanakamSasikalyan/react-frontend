// VirtualTryOn.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './VirtualTryOn.css';
import API_BASE_URL from '../../config/apiConfig';

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userFileName, setUserFileName] = useState('');
  const [clothFileName, setClothFileName] = useState('');
  const userInputRef = useRef(null);
  const clothInputRef = useRef(null);
  const navigate = useNavigate();

  // Handles both file input and drag-drop
  const handleImageChange = (file, setImage, setFileName) => {
    if (file) {
      setImage(file);
      setFileName(file.name);
    }
  };

  // File input change
  const handleFileInputChange = (e, setImage, setFileName) => {
    const file = e.target.files[0];
    handleImageChange(file, setImage, setFileName);
  };

  // Drag-drop handlers
  const handleDrop = (e, setImage, setFileName) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0], setImage, setFileName);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
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
      <div className="content-wrapper">
        <h1 className="page-header">
          DIGITAL FITTING ROOM
        </h1>
        
        <div className="try-on-container">
          <div className="input-section">
            <div
              className="file-input image-drop-zone-vton"
              onDrop={(e) => handleDrop(e, setUserImage, setUserFileName)}
              onDragOver={handleDragOver}
            >
              <label htmlFor="userImage">YOUR PHOTO</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="userImage"
                  accept="image/*"
                  ref={userInputRef}
                  onChange={(e) => handleFileInputChange(e, setUserImage, setUserFileName)}
                />
                <div className="file-input-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7V16C19 17.1046 18.1046 18 17 18H7C5.89543 18 5 17.1046 5 16V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 7H17C17 8.10457 16.1046 9 15 9C13.8954 9 13 8.10457 13 7H11C11 8.10457 10.1046 9 9 9C7.89543 9 7 8.10457 7 7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{userFileName || 'Choose file...'}</span>
                </div>
              </div>
              {userFileName && <div className="file-name-vton">{userFileName}</div>}
              {userImage && (
                <div className="preview-box">
                  <img src={URL.createObjectURL(userImage)} alt="User Preview" />
                </div>
              )}
              <div className="drop-hint-vton">Or drag & drop image here</div>
            </div>

            <div
              className="file-input image-drop-zone-vton"
              onDrop={(e) => handleDrop(e, setClothImage, setClothFileName)}
              onDragOver={handleDragOver}
            >
              <label htmlFor="clothImage">CLOTHING ITEM</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="clothImage"
                  accept="image/*"
                  ref={clothInputRef}
                  onChange={(e) => handleFileInputChange(e, setClothImage, setClothFileName)}
                />
                <div className="file-input-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{clothFileName || 'Choose file...'}</span>
                </div>
              </div>
              {clothFileName && <div className="file-name-vton">{clothFileName}</div>}
              {clothImage && (
                <div className="preview-box">
                  <img src={URL.createObjectURL(clothImage)} alt="Cloth Preview" />
                </div>
              )}
              <div className="drop-hint-vton">Or drag & drop image here</div>
            </div>
          </div>

          <div className="button-group">
            <button 
              className="submit-button" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                  PROCESSING...
                </>
              ) : (
                'GENERATE TRY-ON'
              )}
            </button>
            <button 
              className="back-button-vton" 
              onClick={() => navigate(-1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              BACK
            </button>
          </div>
        </div>

        {resultImage && (
          <div className="result-section">
            <h3>YOUR VIRTUAL TRY-ON RESULT</h3>
            <div className="result-image-wrapper">
              <img src={resultImage} alt="Virtual Try-On Result" className="result-image" />
            </div>
            <a href={resultImage} download="virtual-try-on-result.png" className="download-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DOWNLOAD IMAGE
            </a>
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          &copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI
        </div>
      </footer>
    </div>
  );
};

export default VirtualTryOn;