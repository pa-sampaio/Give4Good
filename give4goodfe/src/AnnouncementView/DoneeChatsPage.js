import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Card.css";
import { useLoading } from "../contexts/LoadingContext";

function DoneeChatsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const userId = sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const isMounted = useRef(true);

  // Helper para delay
  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;
    async function fetchWithRetry() {
      setLoading(true);
      while (!cancelled) {
        try {
          const response = await fetch(`http://localhost:8080/announcements/donee/${userId}`);
          if (!response.ok) throw new Error();
          const data = await response.json();
          if (isMounted.current) {
            setAnnouncements(data);
            setLoading(false);
            break;
          }
        } catch {
          await sleep(2000);
        }
      }
    }
    fetchWithRetry();
    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, [userId, setLoading]);

  return (
    <div className="card-container">
      <div className="card"
        style={{
          maxWidth: 470,
          margin: "2rem auto",
          padding: "18px 18px 20px 18px"
        }}>
        <h2 style={{
          marginBottom: 18,
          color: "#C01722",
          fontWeight: 700,
          textAlign: "center",
          fontSize: "1.1rem",
          lineHeight: "1.2"
        }}>
          Your Private Chats
        </h2>
        {announcements.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: "0.95rem", padding: 8 }}>
            You have not been selected or had a chat initiated for any announcement yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {announcements.map((a) => (
              <li
                key={a.id}
                className="card-comments-section"
                style={{
                  marginBottom: 12,
                  background: "#f6f6f6",
                  border: "1px solid #eee",
                  boxShadow: "0 1px 4px rgba(192, 23, 34, 0.02)",
                  borderRadius: 8,
                  padding: "10px 12px 9px 12px",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10
                }}
              >
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  lineHeight: "1.2"
                }}>
                  <div style={{
                    fontWeight: 600,
                    color: "#C01722",
                    fontSize: 15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {a.product?.name}
                  </div>
                  <div style={{
                    color: "#CB5C63",
                    fontWeight: 500,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {a.product?.category}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/announcementDetails/${a.id}/private-chat/${a.userDonorId}`)}
                  style={{
                    backgroundColor: "#C01722",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "7px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.97rem",
                    marginLeft: 10,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    lineHeight: "1.1",
                  }}
                >
                  Chat
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DoneeChatsPage;