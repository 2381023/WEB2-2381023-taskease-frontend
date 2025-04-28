import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TaskSummary } from '../types/task';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<TaskSummary>('/tasks/summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      {isLoading && <LoadingSpinner />}
      <ErrorMessage message={error} />
      {summary && !isLoading && (
        <div className="dashboard-summary mt-2">
          <div className="summary-card">
            <h3>Completed Tasks</h3>
            <p>{summary.completed}</p>
          </div>
          <div className="summary-card">
            <h3>Pending Tasks</h3>
            <p>{summary.pending}</p>
          </div>
          <div className="summary-card">
            <h3>Near Deadline</h3>
            <p>{summary.nearDeadline}</p>
            <small>(Within 7 days)</small>
          </div>
        </div>
      )}
       {!summary && !isLoading && !error && (
            <p>No summary data available.</p>
        )}
    </div>
  );
};

export default DashboardPage;