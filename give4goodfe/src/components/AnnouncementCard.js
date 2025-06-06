import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnnouncementCard.css';

const getStatusColor = (status) => {
  if (status === "available") return "#4caf50";      // green
  if (status === "sent") return "#ffb300";           // yellow
  if (status === "unavailable") return "#c51d23";    // red
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
      marginTop: 4,
    }}
  >
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const StatusSelector = ({ id, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await fetch(`http://localhost:8080/announcements/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    onStatusChange && onStatusChange(newStatus);
  };

  return (
    <select value={status} onChange={handleChange} style={{marginLeft: 10, borderRadius: 6, padding: "3px 10px"}}>
      <option value="available">Available</option>
      <option value="sent">Sent</option>
      <option value="unavailable">Unavailable</option>
    </select>
  );
};

function AnnouncementCard({ announcement, isDonorView, onStatusUpdated }) {
  const navigate = useNavigate();
  const [donorName, setDonorName] = useState("Unknown");
  const [status, setStatus] = useState(announcement.status || "available");

  React.useEffect(() => {
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

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onStatusUpdated && onStatusUpdated(newStatus);
  };

  const product = announcement.product || {};
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
      <p className="announcement-author">
        <strong>By:</strong> {donorName}
      </p>
      {/* Status Badge & Selector */}
      <div style={{display: "flex", alignItems: "center", marginTop: 6, marginBottom: 8}}>
        <StatusBadge status={status} />
        {isDonorView &&
          <StatusSelector
            id={announcement.id}
            currentStatus={status}
            onStatusChange={handleStatusChange}
          />
        }
      </div>
      <button className="more-button" onClick={handleMoreClick}>More</button>
    </div>
  );
}

export default AnnouncementCard;