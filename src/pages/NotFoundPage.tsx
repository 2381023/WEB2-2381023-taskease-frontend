import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // To link appropriately

const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const homePath = isAuthenticated ? '/dashboard' : '/';

  return (
    <div className="not-found-container">
       {/* Optional: Add a background SVG or image via CSS */}
      <h1>404 Error: Page Not Found</h1>
      <p>Oops! The page you are looking for might have been moved or deleted.</p>
      <Link to={homePath} className="button button-primary">
        Go Back to {isAuthenticated ? 'Dashboard' : 'Homepage'}
      </Link>
    </div>
  );
};

export default NotFoundPage;