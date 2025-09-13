import React from 'react';
import { Upload, Cloud } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Cloud className="logo-icon" />
            <h1 className="logo-text">FileVault</h1>
          </div>
          <div className="header-subtitle">
            <Upload className="subtitle-icon" />
            <span>Upload, Store & Manage Your Files</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;