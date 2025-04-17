import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Marketplace.css';

const Marketplace = () => {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
        const response = await axios.get(`${cloudinaryUrl}/resources/image/fashion_designs`);
        const cloudinaryDesigns = response.data.resources.map((resource) => ({
          id: resource.public_id,
          imageUrl: resource.secure_url,
          prompt: resource.public_id.split('_').slice(1).join(' '),
          style: 'unknown', // Default style, can be updated if metadata is available
        }));
        setDesigns(cloudinaryDesigns);
      } catch (error) {
        console.error('Error fetching designs from Cloudinary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter((design) => {
    const matchesFilter = filter === 'all' || design.style === filter;
    const matchesSearch = design.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="marketplace-container">
      <h2>Design Marketplace</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search designs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Styles</option>
          <option value="casual">Casual</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="formal">Formal</option>
          <option value="sporty">Sporty</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading designs...</div>
      ) : (
        <div className="design-grid">
          {filteredDesigns.length > 0 ? (
            filteredDesigns.map((design) => (
              <div key={design.id} className="design-card">
                <img src={design.imageUrl} alt={design.prompt} />
                <div className="design-info">
                  <h3>{design.prompt}</h3>
                  <span className={`style-tag ${design.style}`}>{design.style}</span>
                  <Link to={`/try-on?designId=${design.id}`} className="try-on-button">
                    Try On
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No designs found matching your criteria</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;