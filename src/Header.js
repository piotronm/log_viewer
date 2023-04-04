import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

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
          <Link to='/' className='header-link' onClick={closeMobileMenu}>
            Home
          </Link>
        </li>
        <li className='header-item'>
          <Link to='/about' className='header-link' onClick={closeMobileMenu}>
            About
          </Link>
        </li>
        <li className='header-item'>
          <Link to='/contact' className='header-link' onClick={closeMobileMenu}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
