import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Card.css"; 
import { useLoading } from "../contexts/LoadingContext";

function ClaimRequestsListPage() {
  const { id } = useParams(); // announcement id
  const [claimRequests, setClaimRequests] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [doneeId, setDoneeId] = useState(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const isMounted = useRef(true);

  // Helper para delay
  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // Pega doneeId (não precisa de loader global)
  useEffect(() => {
    fetch(`http://localhost:8080/announcements/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.userDoneeId) setDoneeId(data.userDoneeId);
      });
  }, [id, selecting]);

  // Loader só desaparece se houver pelo menos 1 claimRequest
  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;
    async function fetchWithRetry() {
      setLoading(true);
      while (!cancelled) {
        try {
          const res = await fetch(`http://localhost:8080/announcements/${id}/claim-requests`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (isMounted.current) {
            setClaimRequests(data);
            if (Array.isArray(data) && data.length > 0) {
              setLoading(false);
              break;
            }
          }
          await sleep(2000);
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
  }, [id, selecting, setLoading]);

  const handleSelect = async (userId) => {
    setSelecting(true);
    try {
      const response = await fetch(
        `http://localhost:8080/announcements/${id}/select-claim`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = "Error selecting winner.";
        }
        throw new Error(errorData || "Error selecting winner.");
      }
      Swal.fire(
        "Selected!",
        "Request successfully selected. You can now chat privately with the donee.",
        "success"
      ).then(() => {
        navigate(`/announcementDetails/${id}/private-chat/${userId}`);
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Error selecting winner.",
        "error"
      );
    } finally {
      setSelecting(false);
    }
  };

  const handleStartPrivateChat = async (recipientId) => {
    await fetch(`http://localhost:8080/announcements/${id}/start-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doneeId: recipientId }),
    });
    navigate(`/announcementDetails/${id}/private-chat/${recipientId}`);
  };

  const handleGoToChat = () => {
    navigate(`/announcementDetails/${id}/private-chat/${doneeId}`);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#fff",
        padding: 32,
        borderRadius: 10,
      }}
    >
      <h2>Claim Requests</h2>
      {claimRequests.length === 0 ? (
        <p>No requests for this announcement yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {claimRequests.map((req) => (
            <li
              key={req.userId}
              style={{
                background:
                  doneeId === req.userId || req.selected
                    ? "#d4f5d4"
                    : "#f5f5f5",
                border:
                  doneeId === req.userId || req.selected
                    ? "2px solid #4caf50"
                    : "1px solid #ccc",
                borderRadius: 6,
                marginBottom: 16,
                padding: 16,
              }}
            >
              <div>
                <b>Name:</b> {req.username}
              </div>
              <div>
                <b>Reason:</b> {req.reason}
              </div>
              <div>
                <b>Date:</b> {new Date(req.date).toLocaleString()}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                {doneeId === req.userId || req.selected ? (
                  <div
                    style={{
                      color: "#4caf50",
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    Selected
                  </div>
                ) : (
                  <button
                    className="card-comment-submit"
                    style={{
                      background: "#C01722",
                      color: "#fff",
                      borderRadius: 6,
                      fontWeight: "bold",
                      cursor: selecting ? "not-allowed" : "pointer",
                      padding: "8px 20px",
                      minWidth: 120,
                    }}
                    disabled={selecting}
                    onClick={() => handleSelect(req.userId)}
                  >
                    Select as recipient
                  </button>
                )}
                <button
                  className="card-comment-submit"
                  style={{
                    background: "#C01722",
                    color: "#fff",
                    borderRadius: 6,
                    fontWeight: "bold",
                    cursor: "pointer",
                    padding: "8px 20px",
                    minWidth: 120,
                  }}
                  onClick={() => handleStartPrivateChat(req.userId)}
                  disabled={selecting}
                >
                  Start Private Chat
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {doneeId && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            className="card-comment-submit"
            onClick={handleGoToChat}
            style={{
              background: "#C01722",
              color: "#fff",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: "12px 32px",
              minWidth: 160,
            }}
          >
            Go to Private Chat
          </button>
        </div>
      )}
    </div>
  );
}

export default ClaimRequestsListPage;