import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <span
    className="left-arrow-details" onClick={() => navigate('/announcements')}>
      &lt; back
      </span>
  );
};

export default BackButton;