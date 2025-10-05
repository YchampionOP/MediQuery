import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@types/index';
import { 
  Search, 
  MessageSquare, 
  Settings, 
  LogOut, 
  HeartHandshake, 
  User,
  Menu,
  X
} from 'lucide-react';
import './Header.css';

interface HeaderProps {
  userRole: UserRole;
  onRoleChange: (role: UserRole | null) => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onRoleChange }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    onRoleChange(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const roleIcon = userRole === 'clinician' ? <HeartHandshake size={20} /> : <User size={20} />;
  const roleLabel = userRole === 'clinician' ? 'Healthcare Professional' : 'Patient';

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-icon">
              <HeartHandshake size={28} />
            </div>
            <span className="brand-text">MediQuery AI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <ul className="nav-list">
            <li>
              <Link to="/chat" className="nav-link">
                <MessageSquare size={18} />
                <span>Chat</span>
              </Link>
            </li>
            <li>
              <Link to="/search" className="nav-link">
                <Search size={18} />
                <span>Search</span>
              </Link>
            </li>
            <li>
              <Link 
                to={userRole === 'clinician' ? '/clinician' : '/patient'} 
                className="nav-link"
              >
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="nav-link">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Info and Actions */}
        <div className="header-actions">
          <div className="user-info">
            <div className="role-indicator">
              {roleIcon}
              <span className="role-text">{roleLabel}</span>
            </div>
          </div>

          <button 
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
            <span className="logout-text">Logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
        <ul className="mobile-nav-list">
          <li>
            <Link to="/chat" className="mobile-nav-link" onClick={closeMobileMenu}>
              <MessageSquare size={18} />
              <span>Chat</span>
            </Link>
          </li>
          <li>
            <Link to="/search" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Search size={18} />
              <span>Search</span>
            </Link>
          </li>
          <li>
            <Link 
              to={userRole === 'clinician' ? '/clinician' : '/patient'} 
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="mobile-nav-link" onClick={closeMobileMenu}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button 
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;