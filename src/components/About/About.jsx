import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Metaverse Fashion Studio</h1>

      <section className="about-section">
        <div className="about-content">
          <h2>Problem Statement</h2>
          <p>
            The fashion industry lacks a platform for quickly visualizing and prototyping clothing designs. Designers and retailers need a tool to generate high-quality designs based on textual descriptions.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Goal</h2>
          <p>
            To provide a platform where users can input prompts describing their desired clothing designs, and the AI generates corresponding images. This enables designers, retailers, and fashion enthusiasts to visualize and prototype clothing ideas efficiently.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Literature Review</h2>
          <p>
            This section will include a detailed review of existing technologies and methodologies used in the fashion industry. (Duplicate text for now)
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Technical Specifications</h2>
          <ul>
            <li>AI Model: Stable Diffusion ("CompVis/stable-diffusion-v1-4")</li>
            <li>Framework: Hugging Face Diffusers</li>
            <li>Cloud Integration: ImageKit for storing generated images</li>
            <li>Database: PostgreSQL for storing metadata</li>
          </ul>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Technologies Used</h2>
          <h3>Frontend</h3>
          <ul>
            <li>React.js for building interactive user interfaces</li>
            <li>React Router for navigation</li>
            <li>CSS for styling and responsive design</li>
          </ul>
          <h3>Backend</h3>
          <ul>
            <li>Spring Boot for RESTful API development</li>
            <li>Python for AI-based image generation</li>
          </ul>
          <h3>Databases</h3>
          <ul>
            <li>PostgreSQL for database management</li>
          </ul>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>AI Model Description</h2>
          <p>
            The project uses the Stable Diffusion model ("CompVis/stable-diffusion-v1-4") for generating high-quality clothing designs. This model is integrated using the Hugging Face Diffusers library, enabling efficient and scalable AI-based image generation.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Future Enhancements</h2>
          <ul>
            <li>Integration with AR/VR for virtual try-ons</li>
            <li>Support for 3D clothing models</li>
            <li>Enhanced AI models for more realistic designs</li>
            <li>Mobile application for on-the-go design generation</li>
          </ul>
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <h2>Current Features</h2>
          <ul>
            <li>AI-based clothing design generation</li>
            <li>Virtual try-on functionality</li>
            <li>Cloud storage for generated images</li>
            <li>More features coming soon...</li>
          </ul>
        </div>
      </section>

      <footer className="about-footer">
        &copy; {new Date().getFullYear()} Metaverse Fashion Studio
      </footer>
    </div>
  );
};

export default About;