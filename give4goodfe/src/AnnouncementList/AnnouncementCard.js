import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnnouncementCard.css';

const getStatusColor = (status) => {
  if (status === "available") return "#4caf50";
  if (status === "sent") return "#ffb300";
  if (status === "unavailable") return "#c51d23";
  if (status === "claimed") return "#8884d8";
  return "#bbb";
};

const StatusBadge = ({ status }) => (
  <span
    style={{
      display: "inline-block",
      padding: "4px 14px",
      borderRadius: "25px",
      background: getStatusColor(status),
      color: "#fff",
      fontWeight: "bold",
      fontSize: "0.97rem",
      marginBottom: 8,
      marginTop: 4
    }}
  >
    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Available"}
  </span>
);

function AnnouncementCard({ announcement }) {
  const navigate = useNavigate();
  const [donorName, setDonorName] = useState("Unknown");

  useEffect(() => {
    if (announcement.userDonorId) {
      fetch(`http://localhost:8080/users/${announcement.userDonorId}`)
        .then(response => {
          if (!response.ok) throw new Error('Erro ao buscar nome');
          return response.json();
        })
        .then(data => {
          setDonorName(data.name || "Unknown");
        })
        .catch(() => {
          setDonorName("Unknown");
        });
    }
  }, [announcement.userDonorId]);

  const handleMoreClick = () => {
    navigate(`/announcementDetails/${announcement.id}`);
  };

  const product = announcement.product || {};
  const [imgError, setImgError] = useState(false);

  // Sempre mostra o número de claims, mesmo que esteja zero
  const numClaims = Array.isArray(announcement.claimRequests) ? announcement.claimRequests.length : 0;

  return (
    <div className="announcement-card">
      {product.photoUrl && !imgError ? (
        <img
          src={product.photoUrl}
          alt={product.name || "Product"}
          className="announcement-image"
          onError={() => setImgError(true)}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="announcement-image placeholder">
          No image available
        </div>
      )}

      <h2 className="announcement-title">{product.name || "No title available"}</h2>
      <p className="announcement-category">{product.category || "No category specified"}</p>

      <StatusBadge status={announcement.status} />

      <p className="announcement-author">
        <strong>By:</strong> {donorName}
      </p>

      <p className="announcement-claims" style={{ marginTop: 8, fontSize: 15, color: "#555" }}>
        <span role="img" aria-label="claims">🤝</span>
        {numClaims} {numClaims === 1 ? 'claim' : 'claims'} recebidos
      </p>

      <button className="more-button" onClick={handleMoreClick}>More</button>
    </div>
  );
}

export default AnnouncementCard;