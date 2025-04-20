import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const imagekitUrlEndpoint = 'https://ik.imagekit.io/sp7ub8zm6/fashion_designs';

    const fetchDesigns = async () => {
      try {
        // Fetch image URLs from backend API
        const response = await fetch('http://localhost:8081/api/designs/image-urls');
        const imageUrls = await response.json();
        
        // Process URLs to match your existing format
        const sampleFilenames = imageUrls.map(url => {
          // Extract filename from URL (last part after last slash)
          return url.substring(url.lastIndexOf('/') + 1);
        });

        // Keep your exact same mapping logic
        const fetchedDesigns = sampleFilenames.map((filename) => ({
          id: filename,
          imageUrl: `${imagekitUrlEndpoint}/${filename}`,
          prompt: filename.replace('design_', '').replace('.png', '').replace(/_/g, ' '),
          style: 'unknown',
        }));

        setDesigns(fetchedDesigns);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching designs:', error);
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



//Old Code
/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
  const [designs, setDesigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚠️ Replace with your actual ImageKit ID
    const imagekitUrlEndpoint = 'https://ik.imagekit.io/sp7ub8zm6/fashion_designs';

    // ⚠️ Replace with your list of filenames if needed (backend or metadata could help here)
    const sampleFilenames = [
      'design_20240401_123456_123456.png',
      'design_20240401_123457_123457.png',
      'design_20240401_123458_123458.png'
    ];

    const fetchedDesigns = sampleFilenames.map((filename) => ({
      id: filename,
      imageUrl: `${imagekitUrlEndpoint}/${filename}`,
      prompt: filename.replace('design_', '').replace('.png', '').replace(/_/g, ' '),
      style: 'unknown',
    }));

    setDesigns(fetchedDesigns);
    setLoading(false);
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

export default Marketplace;*/
