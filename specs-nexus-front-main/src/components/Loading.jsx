import React from 'react';
import '../styles/Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loadings">
      <div className="loadings-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loading;