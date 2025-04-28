import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="container text-center">
      <h1 className="mt-2 mb-1" style={{ fontSize: '2.5rem' }}>Welcome to TaskEase</h1>
      <p className="mb-2" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
        The simple and effective way to manage your daily tasks.
      </p>
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
         <p>Stay organized, boost your productivity, and never miss a deadline again. Sign up or log in to get started!</p>
         <div className='mt-2'>
              <Link to="/login" className="button button-primary mr-1">Login</Link>
              <Link to="/register" className="button">Register</Link>
         </div>
      </div>

    </div>
  );
};

export default LandingPage;