import React, { useState } from 'react';
import axios from 'axios';
import './VirtualTryOn.css';

const API_BASE_URL = "https://fashion-studio-ai.onrender.com";

const VirtualTryOn = () => {
  const [userImage, setUserImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

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
      const response = await axios.post(`${API_BASE_URL}/api/virtual-tryon/try-on`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultImage(response.data); // Assuming the backend returns the image URL
    } catch (error) {
      console.error('Error submitting images:', error);
      alert('Failed to process the images. Please try again.');
    }
  };

  return (
    <div className="try-on-page">
      <h1 className="page-header">Virtual Try-On</h1>
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

        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>

      {resultImage && (
        <div className="result-section">
          <h3>Result</h3>
          <img src={resultImage} alt="Virtual Try-On Result" className="result-image" />
          <a href={resultImage} download className="download-button">Download Image</a>
        </div>
      )}

      <footer className="footer">&copy; 2025 Virtual Try-On. All rights reserved.</footer>
    </div>
  );
};

export default VirtualTryOn;