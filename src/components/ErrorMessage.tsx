import React from 'react';

interface ErrorMessageProps {
  message: string | null | undefined;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return <p className="error-message">{message}</p>;
};

export default ErrorMessage;