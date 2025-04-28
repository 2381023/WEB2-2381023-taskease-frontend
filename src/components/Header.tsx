import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <header className="app-header">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo">
        <span className="logo-icon"></span> {/* Basic Icon */}
        TaskEase
      </Link>
      <nav>
        <ul className="nav-links">
          {isAuthenticated ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/tasks">Tasks</Link></li>
              <li><Link to="/profile">Profile ({user?.name})</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;