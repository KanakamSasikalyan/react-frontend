import React, { useState } from 'react';
import axios from 'axios';
import './ShirtComparison.css';

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
    formData.append('image1', image1);
    formData.append('platform1', platform1);
    formData.append('price1', price1);
    formData.append('description1', description1);
    formData.append('image2', image2);
    formData.append('platform2', platform2);
    formData.append('price2', price2);
    formData.append('description2', description2);

    try {
      const response = await axios.post('/api/shirts/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error comparing shirts:', error);
      setResult({ status: 'error', message: 'Failed to compare shirts. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shirt-comparison-container">
      <h2>Shirt Comparison</h2>
      <form onSubmit={handleSubmit} className="shirt-comparison-form">
        <div className="form-group">
          <label>Upload Image 1</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage1, setPreview1)} />
          {preview1 && <img src={preview1} alt="Preview 1" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Platform 1</label>
          <select value={platform1} onChange={(e) => setPlatform1(e.target.value)}>
            <option value="">-- Select Platform --</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price 1</label>
          <input type="number" step="0.01" value={price1} onChange={(e) => setPrice1(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Description 1</label>
          <textarea value={description1} onChange={(e) => setDescription1(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Upload Image 2</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage2, setPreview2)} />
          {preview2 && <img src={preview2} alt="Preview 2" className="image-preview" />}
        </div>

        <div className="form-group">
          <label>Platform 2</label>
          <select value={platform2} onChange={(e) => setPlatform2(e.target.value)}>
            <option value="">-- Select Platform --</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Price 2</label>
          <input type="number" step="0.01" value={price2} onChange={(e) => setPrice2(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Description 2</label>
          <textarea value={description2} onChange={(e) => setDescription2(e.target.value)} />
        </div>

        <button type="submit" disabled={isLoading}>{isLoading ? 'Comparing...' : 'Compare Shirts'}</button>
      </form>

      {result && (
        <div className="comparison-result">
          <h3>Comparison Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ShirtComparison;