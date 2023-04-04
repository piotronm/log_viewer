import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className='footer-container'>
      <div className='footer-content'>
        <h2 className='footer-title'>Footer Title</h2>
        <p className='footer-text'>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className='footer-social-icons'>
          <a href='/' className='footer-icon-link'><i className='fab fa-facebook-f'></i></a>
          <a href='/' className='footer-icon-link'><i className='fab fa-twitter'></i></a>
          <a href='/' className='footer-icon-link'><i className='fab fa-instagram'></i></a>
        </div>
      </div>
      <div className='footer-top-border'></div>
    </footer>
  );
}

export default Footer;
