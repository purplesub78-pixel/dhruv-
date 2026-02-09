import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Services', target: 'services' },
    { label: 'Work', target: 'portfolio' },
    { label: 'About', target: 'about' },
    { label: 'Contact', target: 'contact' }
  ];

  const handleNavClick = (target) => {
    onNavigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => onNavigate('home')}>
          <span className="logo-text">Purple Aster Studio</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className="nav-link"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <Button 
          className="header-cta"
          onClick={() => handleNavClick('inquiry')}
        >
          Get a Quote
        </Button>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className="mobile-nav-link"
            >
              {item.label}
            </button>
          ))}
          <Button 
            className="w-full mt-4"
            onClick={() => handleNavClick('inquiry')}
          >
            Get a Quote
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
