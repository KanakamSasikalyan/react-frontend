import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';
import API_BASE_URL from '../../config/apiConfig';

const About = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');
    if (!name || !rating || !comment) {
      setSubmitMsg('Please fill all fields and select a rating.');
      return;
    }
    try {
      // Assumes POST /api/reviews { name, rating, comment }
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment })
      });
      if (res.ok) {
        setSubmitMsg('Thank you for your feedback!');
        setName(''); setRating(0); setComment('');
        setTimeout(() => setShowFeedback(false), 1200);
      } else {
        setSubmitMsg('Failed to submit review.');
      }
    } catch {
      setSubmitMsg('Failed to submit review.');
    }
  };

  return (
    <div className="about-container">
      <div className="about-actions">
        <button className="btn btn-small" onClick={() => setShowFeedback(true)}>Share Feedback</button>
        <button className="btn btn-small" onClick={() => navigate('/reviews')}>Read All Reviews</button>
      </div>
      {showFeedback && (
        <div className="feedback-modal">
          <form className="review-form" onSubmit={handleSubmit}>
            <div style={{marginBottom: '0.5rem'}}>
              <label>Name: </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" style={{marginLeft: '0.5rem'}} />
            </div>
            <div style={{marginBottom: '0.5rem'}}>
              <label>Rating: </label>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{cursor:'pointer', color: star <= rating ? '#f5b301' : '#ccc', fontSize: '1.2rem'}}
                  aria-label={star + ' star'}
                >★</span>
              ))}
            </div>
            <div style={{marginBottom: '0.5rem'}}>
              <label>Comment: </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} className="input" rows={2} style={{marginLeft: '0.5rem', width: '60%'}} />
            </div>
            <div style={{display:'flex', alignItems:'center'}}>
              <button type="submit" className="btn btn-small">Submit</button>
              <button type="button" className="btn btn-small btn-cancel" onClick={() => setShowFeedback(false)} style={{marginLeft:'0.5rem'}}>Cancel</button>
            </div>
            {submitMsg && <div style={{marginTop:'0.5rem', color: submitMsg.startsWith('Thank') ? 'green' : 'red'}}>{submitMsg}</div>}
          </form>
        </div>
      )}
      <h1 className="about-title">Revolutionizing Style with AI: Inside the Making of Our AI Fashion Studio</h1>
      <section className="about-section">
        <div className="about-content">
          <p>
            I’m Kalyan, working as a Software Engineer at a leading multinational corporation, with a deep interest in cutting-edge technologies that can drive practical, industry-level transformations. Over the past few months, I’ve been immersed in one of the most ambitious and innovative projects I’ve ever worked on—developing an AI Fashion Studio. This page is a window into the journey we undertook, the vision that powered our progress, the technical foundation that brought it to life, and how this solution is uniquely positioned to impact the fashion industry.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Introduction to the Vision</h2>
          <p>
            Fashion is no longer just about fabric and trends. It's about data, personalization, and intelligence. Our goal with the AI Fashion Studio was to blend artificial intelligence with fashion creativity—building a platform where users, clients, and fashion businesses could generate, explore, and visualize fashion-forward designs using AI capabilities. This studio isn't just a design tool. It is a research-driven, intelligent system that understands user preferences, creates virtual outfits, and predicts fashion trends based on visual and contextual data.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>The Research Backbone: Data that Drives Intelligence</h2>
          <p>
            To build this system, we invested heavily in the research phase. We gathered and analyzed thousands of fashion datasets, which included annotated images, style descriptors, season-based catalogues, and trend timelines from various fashion houses. We included information such as fabric types, color palettes, occasion-specific styles, body types, and global trends to teach the AI model how fashion is interpreted culturally and individually.
          </p>
          <p>
            In addition to image-based data, we also gathered metadata about fashion preferences—things like age group, climate influence, regional styles, and even user browsing patterns. This multi-modal dataset gave the AI model a holistic understanding of the fashion ecosystem, allowing it to move beyond basic style generation and into the realm of personalization and prediction.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Strategy and Development Methodology</h2>
          <p>
            Our approach to building the AI Fashion Studio was rooted in agile experimentation and iterative feature development. We did not simply build everything from scratch or follow a rigid plan—instead, we focused on developing and refining each major feature of the platform step by step. Key features include AI-powered design generation using prompts, a digital marketplace, camera-based virtual try-on, a digital room for outfit visualization, outfit suggestion, and multiplatform comparison of clothes to recommend the best choice.
          </p>
          <p>
            Each feature was developed, tested in the development environment, and then recursively tested with different scenarios to produce the best and most optimized outputs. This hands-on, iterative process allowed us to quickly identify issues, optimize performance, and ensure that every part of the AI Fashion Studio delivers real value to users.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Technical Foundation and Key Elements</h2>
          <ul>
            <li><b>Image Generation:</b> Advanced diffusion models and GANs (Generative Adversarial Networks) to create high-quality fashion visuals, trained and fine-tuned using curated fashion datasets.</li>
            <li><b>Recommendation Engine:</b> Deep learning models to suggest personalized outfits based on user behavior and style history.</li>
            <li><b>Backend Services:</b> Spring Boot and microservice-based architecture for scalability and performance.</li>
            <li><b>Frontend:</b> React with seamless state management and responsive UI for fluid user experiences across devices.</li>
            <li><b>Continuous Deployment:</b> Microsoft Azure for deployment, with GitHub workflows enabling a streamlined CI/CD pipeline for quick releases, automated testing, and environment management.</li>
          </ul>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>What Makes It Unique</h2>
          <p>
            This is not just another AI tool. What makes our AI Fashion Studio stand apart is its capability to adapt and learn user preferences, create new design trends, and generate complete fashion collections with minimal human intervention. Its intelligence goes beyond recommending existing outfits—it creates entirely new fashion ideas that are contextually and aesthetically aligned with user needs.
          </p>
          <p>
            Our focus on hyper-personalization, cultural relevance, and seasonal adaptability sets this platform apart as a true innovation in fashion-tech. Whether you’re a designer, a brand, or a consumer, the AI Fashion Studio speaks your language.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Value to Users, Clients, and the Industry</h2>
          <p>
            For users, this platform is a personalized fashion stylist. For designers and fashion houses, it is a co-creator that can accelerate the design process, spark creativity, and reduce time-to-market. For retailers, it offers a new way to visualize products and style catalogs dynamically. It empowers businesses to keep up with fast fashion demands while remaining sustainable by minimizing physical samples and test collections.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Ethical Considerations and Responsible AI</h2>
          <p>
            We were mindful of the ethical implications of deploying AI in creative industries. Every AI decision in our system is explainable to a certain level, and user data is strictly anonymized and encrypted. We trained our models on diverse datasets to reduce bias, ensuring that the platform celebrates all body types, skin tones, and cultural expressions.
          </p>
          <p>
            We implemented strict guardrails to prevent misuse, such as generating inappropriate or culturally insensitive attire. Our design process also included human reviews in all key training and testing stages to maintain responsibility and inclusiveness.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Driving the Future of Fashion with AI</h2>
          <p>
            Fashion is emotional, cultural, and personal. We wanted to ensure our AI wasn’t just smart—it had to be sensitive and stylish. This project has allowed us to move closer to a future where AI doesn’t just assist fashion—it drives it.
          </p>
          <p>
            By integrating continuous learning, user feedback loops, and trend forecasting algorithms, the AI Fashion Studio evolves constantly. This ensures it remains relevant in a rapidly changing fashion landscape, giving our users an ever-evolving experience that feels both futuristic and grounded in real-world fashion sensibilities.
          </p>
        </div>
      </section>
      <section className="about-section">
        <div className="about-content">
          <h2>Final Thoughts</h2>
          <p>
            Working on this project has not only been a great technical challenge but also a deeply satisfying journey. Watching lines of code evolve into a tool that can create style, speak fashion, and touch lives has been the highlight of my recent work. The AI Fashion Studio is more than a project—it’s a step into the future of intelligent design.
          </p>
          <p>
            Stay tuned as we continue to expand its capabilities, explore collaborations with fashion brands, and open up the platform to more users. Fashion meets code—and the results are stunning.
          </p>
        </div>
      </section>
      <footer className="about-footer">
        &copy; {new Date().getFullYear()} Metaverse Fashion Studio <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub Dev</a>
      </footer>
    </div>
  );
};

export default About;