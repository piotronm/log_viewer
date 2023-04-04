import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleAboutClick = () => {
    const top = document.getElementById('top');
    top.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    const bottom = document.getElementById('bottom');
    bottom.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className='header'>
      <Link to='/' className='header-logo' onClick={closeMobileMenu}>
        <h1>Log Viewer</h1>
      </Link>
      <div className='header-menu-icon' onClick={handleClick}>
        <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
      </div>
      <ul className={click ? 'header-menu active' : 'header-menu'}>
        <li className='header-item'>
          <button className='header-link' onClick={handleAboutClick}>
            Top of Page
          </button>
        </li>
        <li className='header-item'>
          <button className='header-link' onClick={handleContactClick}>
            Bottom of Page
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Header;