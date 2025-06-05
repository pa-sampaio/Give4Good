import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DoneeChatsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch(`http://localhost:8080/announcements/donee/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch announcements");
        const data = await response.json();
        setAnnouncements(data);
      } catch {
        setAnnouncements([]);
      }
      setLoading(false);
    }
    fetchAnnouncements();
  }, [userId]);

  if (loading) return <div style={{padding: 40, textAlign: "center"}}>Loading chats...</div>;

  if (announcements.length === 0) {
    return <div style={{padding: 40, textAlign: "center"}}>You have not been selected for any announcement yet.</div>;
  }

  // Se só tem um, redireciona logo
  if (announcements.length === 1) {
    navigate(`/announcementDetails/${announcements[0].id}/private-chat`);
    return null;
  }

  // Se tem vários, mostra lista
  return (
    <div style={{maxWidth: 600, margin: "2rem auto", padding: 32, background: "#fff", borderRadius: 10}}>
      <h2>Your Chats</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {announcements.map((a) => (
          <li key={a.id} style={{border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 18}}>
            <div>
              <b>Product:</b> {a.product?.name}
            </div>
            <div>
              <b>Category:</b> {a.product?.category}
            </div>
            <button
              onClick={() => navigate(`/announcementDetails/${a.id}/private-chat`)}
              style={{
                marginTop: 10,
                backgroundColor: "#C01722",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Go to Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DoneeChatsPage;