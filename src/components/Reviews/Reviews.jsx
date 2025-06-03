import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config/apiConfig';
import './About.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [likeAnimating, setLikeAnimating] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  const handleLike = async (id) => {
    setLikeAnimating(prev => ({ ...prev, [id]: true }));
    await fetch(`${API_BASE_URL}/api/reviews/${id}/like`, { method: 'POST' });
    setReviews(reviews => reviews.map(r => r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r));
    setTimeout(() => setLikeAnimating(prev => ({ ...prev, [id]: false })), 500);
  };

  return (
    <div className="about-container">
      <h1 className="about-title">User Reviews</h1>
      <section className="about-section">
        <div className="about-content">
          {reviews.length === 0 ? (
            <div>No reviews yet.</div>
          ) : (
            <ul style={{padding:0}}>
              {reviews.map(r => (
                <li key={r.id} style={{marginBottom:'1.2rem', listStyle:'none', borderBottom:'1px solid #eee', paddingBottom:'0.7rem'}}>
                  <div style={{fontWeight:'bold'}}>{r.name} <span style={{color:'#f5b301'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div>
                  <div style={{margin:'0.3rem 0'}}>{r.comment}</div>
                  <button
                    className="btn"
                    style={{fontSize:'0.9rem', position:'relative'}}
                    onClick={() => handleLike(r.id)}
                  >
                    👍 Like {r.likes || 0}
                    {likeAnimating[r.id] && <span style={{position:'absolute', left:'100%', marginLeft:'0.3rem', color:'#f5b301', fontSize:'1.2rem', transition:'all 0.5s'}}>+1</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reviews;
