import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { User } from '../types/user';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage: React.FC = () => {
  const { user, fetchUserProfile } = useAuth(); // Get user and fetch function from context
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // For password update
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    // Fetch profile again on mount in case context wasn't fully loaded
    // or if direct navigation happened.
    // fetchUserProfile();
  }, [user]); // Rerun effect if user object changes in context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password && password.length < 6) {
         setError("New password must be at least 6 characters long.");
         return;
    }


    setIsLoading(true);

    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name !== user?.name) updateData.name = name;
    if (email !== user?.email) updateData.email = email;
    if (password) updateData.password = password; // Only include password if provided


    // Only send request if something changed or if password is being updated
     if (Object.keys(updateData).length === 0) {
         setError("No changes detected.");
         setIsLoading(false);
         return;
    }


    try {
      await api.put('/users/me', updateData);
      setSuccess('Profile updated successfully!');
      setPassword(''); // Clear password fields after successful update
      setConfirmPassword('');
      await fetchUserProfile(); // Refresh user data in context
    } catch (err: any) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user && !isLoading) {
      // This case might happen briefly during loading or if auth fails silently
      return <div className="container"><p>Loading profile...</p></div>;
  }
  if (!user) {
      // Still loading or auth issue
      return <div className="container"><LoadingSpinner /></div>;
  }


  return (
    <div className="container">
      <h1>My Profile</h1>

      <div className="card mb-2">
          <h2>Current Information</h2>
          <div className='profile-info'>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><small>Member Since: {formatDate(user.createdAt)}</small></p>
          </div>
      </div>


      <div className="card">
         <h2>Update Profile</h2>
        <form onSubmit={handleSubmit}>
          <ErrorMessage message={error} />
          {success && <p style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>{success}</p>}

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
           <h3 className='mt-2' style={{ fontSize: '1.1rem', color: 'var(--text-secondary)'}}>Change Password (Optional)</h3>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              disabled={isLoading}
            />
          </div>
           <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isLoading || !password} // Disable if no new password entered
            />
          </div>
          <button type="submit" className="button button-primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
 // Helper function (can be moved to a utils file)
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        return "Invalid Date";
    }
};


export default ProfilePage;