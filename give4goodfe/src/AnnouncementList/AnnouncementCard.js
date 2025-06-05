import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnnouncementCard.css';

// Função para cor do status
const getStatusColor = (status) => {
  if (status === "available") return "#4caf50";      // green
  if (status === "sent") return "#ffb300";           // yellow
  if (status === "unavailable") return "#c51d23";    // red
  return "#bbb";
};

// Badge visual para o status
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

  // Corrige o src para garantir que não há espaços extras e faz fallback para mostrar erro de imagem
  const [imgError, setImgError] = useState(false);

  return (
    <div className="announcement-card">
      {product.photoUrl && !imgError ? (
        <img
          src={product.photoUrl}
          alt="Announcement image"
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

      {/* Mostra status para todos */}
      <StatusBadge status={announcement.status} />

      <p className="announcement-author">
        <strong>By:</strong> {donorName}
      </p>

      <button className="more-button" onClick={handleMoreClick}>More</button>
    </div>
  );
}

export default AnnouncementCard;