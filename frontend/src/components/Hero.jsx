import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';

const Hero = ({ onGetQuote, onViewWork }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text-container">
          <h1 className="hero-title">
            We Craft Stories
            <span className="hero-title-accent">Through Motion</span>
          </h1>
          <p className="hero-subtitle">
            Video Production for Brands, Events & Artists
          </p>
          <div className="hero-buttons">
            <Button 
              size="lg" 
              className="cta-primary"
              onClick={onGetQuote}
            >
              Get a Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="cta-secondary"
              onClick={onViewWork}
            >
              <Play className="mr-2 h-5 w-5" />
              View Work
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="hero-decoration">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line"></div>
        <span className="scroll-text">Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
