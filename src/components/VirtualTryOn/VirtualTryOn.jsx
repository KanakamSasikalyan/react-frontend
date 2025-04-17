import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [mode, setMode] = useState('camera');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const videoRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const designId = searchParams.get('designId');
    if (designId) fetchDesign(designId);
  }, [location]);

  const fetchDesign = async (id) => {
    try {
      const response = await axios.get(`/api/designs/${id}`);
      setSelectedDesign(response.data);
    } catch (error) {
      console.error('Error fetching design:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const applyDesign = async () => {
    if (!selectedDesign) return;
    
    try {
      let imageData;
      if (mode === 'camera' && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        imageData = canvas.toDataURL('image/jpeg');
      } else if (mode === 'upload' && uploadedImage) {
        imageData = uploadedImage;
      }

      const response = await axios.post('/api/try-on', {
        designId: selectedDesign.id,
        image: imageData
      });
      setResultImage(response.data.resultImage);
    } catch (error) {
      console.error('Error applying design:', error);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
      return () => {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [mode]);

  return (
    <div className="try-on-container">
      <h2>Virtual Try-On</h2>
      
      {!selectedDesign ? (
        <div className="select-design-prompt">
          <p>Please select a design from the Marketplace to try on</p>
          <button onClick={() => navigate('/marketplace')} className="browse-button">
            Browse Marketplace
          </button>
        </div>
      ) : (
        <>
          <div className="try-on-modes">
            <button onClick={() => setMode('camera')} className={mode === 'camera' ? 'active' : ''}>
              Use Camera
            </button>
            <button onClick={() => setMode('upload')} className={mode === 'upload' ? 'active' : ''}>
              Upload Photo
            </button>
          </div>
          
          <div className="try-on-content">
            <div className="source-container">
              {mode === 'camera' ? (
                <video ref={videoRef} autoPlay playsInline className="video-preview" />
              ) : (
                <>
                  <input type="file" accept="image/*" onChange={handleImageUpload} id="upload-input" />
                  <label htmlFor="upload-input" className="upload-area">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                    ) : (
                      <div className="upload-prompt">Click to upload a photo</div>
                    )}
                  </label>
                </>
              )}
            </div>
            
            <div className="design-preview">
              <h3>Selected Design</h3>
              <img src={selectedDesign.imageUrl} alt={selectedDesign.prompt} />
              <button onClick={applyDesign} className="apply-button">
                Apply Design
              </button>
            </div>
          </div>
          
          {resultImage && (
            <div className="result-section">
              <h3>Your Virtual Try-On</h3>
              <img src={resultImage} alt="Virtual try-on result" className="result-image" />
              <button className="download-button">Download Image</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VirtualTryOn;