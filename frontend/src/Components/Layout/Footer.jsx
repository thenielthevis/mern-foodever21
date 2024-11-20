import React from 'react';
import { Container } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
        <div className="contact-info">
          <p><FaPhone /> +1 234 567 890</p>
          <p><FaEnvelope /> contact@mywebsite.com</p>
        </div>
        <div className="address">
          <p><FaMapMarkerAlt /> 123 Food Street, Foodie City, FL 12345</p>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} FOODEVER 21. All Rights Reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;
