import React from 'react';
import { Camera } from 'lucide-react';

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-icon-wrapper">
            <Camera className="about-icon" />
          </div>
          <h2 className="about-title">About Purple Aster Studio</h2>
          <div className="about-text">
            <p className="about-paragraph">
              At Purple Aster Studio, we believe every brand has a story worth telling. 
              We're a collective of filmmakers, storytellers, and visual artists dedicated 
              to crafting cinematic experiences that captivate, inspire, and convert.
            </p>
            <p className="about-paragraph">
              Founded with a passion for visual storytelling, we've evolved into a 
              full-service video production studio that serves brands, artists, and 
              organizations across industries. From concept to final cut, we obsess 
              over every frame, ensuring your vision comes to life with unparalleled 
              quality and creativity.
            </p>
            <p className="about-paragraph">
              Our approach combines technical excellence with artistic vision. We don't 
              just capture footage—we craft narratives that resonate emotionally and 
              drive results. Whether it's a 15-second social clip or a feature-length 
              documentary, we bring the same level of dedication, innovation, and 
              cinematic quality to every project.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-item">
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">Projects Completed</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">200+</h3>
              <p className="stat-label">Happy Clients</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">50M+</h3>
              <p className="stat-label">Views Generated</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">15+</h3>
              <p className="stat-label">Awards Won</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
