import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../../config/apiConfig';
import './Reviews.css';

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
    <div className="about-container-rv">
      <h1 className="about-title-rv">User Reviews</h1>
      <section className="about-section-rv">
        <div className="about-content-rv">
          {reviews.length === 0 ? (
            <div>No reviews yet.</div>
          ) : (
            <ul className="reviews-list-rv">
              {reviews.map(r => (
                <li key={r.id}>
                  <div className="review-author-rv">{r.name} <span className="review-stars-rv">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div>
                  <div className="review-comment-rv">{r.comment}</div>
                  <button
                    className="btn-rv"
                    onClick={() => handleLike(r.id)}
                  >
                    👍 Like {r.likes || 0}
                    {likeAnimating[r.id] && <span className="like-anim-rv">+1</span>}
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
