import React from 'react';
import { Instagram, Youtube, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Mail, label: 'Email', href: 'mailto:hello@purpleasterstudio.com' }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">Purple Aster Studio</h3>
            <p className="footer-tagline">Crafting Stories Through Motion</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-list">
                <li><a href="#services" className="footer-link">Brand Videos</a></li>
                <li><a href="#services" className="footer-link">Event Coverage</a></li>
                <li><a href="#services" className="footer-link">Commercials</a></li>
                <li><a href="#services" className="footer-link">Social Content</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><a href="#about" className="footer-link">About Us</a></li>
                <li><a href="#portfolio" className="footer-link">Our Work</a></li>
                <li><a href="#contact" className="footer-link">Contact</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Connect</h4>
              <div className="social-links">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="social-link"
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Purple Aster Studio. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <span className="footer-separator">•</span>
            <a href="#" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
