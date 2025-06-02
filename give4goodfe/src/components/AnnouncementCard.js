import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AnnouncementCard.css';

function AnnouncementCard({ id, title, category }) {
  const navigate = useNavigate(); // Hook para navegação

  const handleEditClick = () => {
    navigate(`/EditAd/${id}`);
  };

  return (
    <div className="announcement-card">
      <h2 className="card-title">{title}</h2>
      <p className="card-category">{category}</p>
      <button className="edit-button" onClick={handleEditClick}>Edit</button>
    </div>
  );
}

export default AnnouncementCard;
