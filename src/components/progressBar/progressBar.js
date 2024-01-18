import React, { useState, useEffect } from 'react';
import './progressBar.css';

const ProgressBar = ({ value, max }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const calculatedPercentage = (value / max) * 100;
    setPercentage(calculatedPercentage);
  }, [value, max]);

  return (
    <div className="progress1-bar-container">
      <div className="progress1-bar">
        <div className="progress1" style={{ width: `${percentage}%` }}>
          {percentage.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
