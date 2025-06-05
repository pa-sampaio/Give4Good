import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

/**
 * Page for the donor to view all claim requests and choose the winner.
 * (Assumes only the donor sees this screen)
 */
function ClaimRequestsListPage() {
  const { id } = useParams(); // announcement id
  const [claimRequests, setClaimRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [doneeId, setDoneeId] = useState(null);
  const navigate = useNavigate();

  // Fetch the doneeId of the announcement to visually show who was selected
  useEffect(() => {
    fetch(`http://localhost:8080/announcements/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.userDoneeId) setDoneeId(data.userDoneeId);
      });
  }, [id, selecting]); // Update doneeId after selecting

  useEffect(() => {
    fetch(`http://localhost:8080/announcements/${id}/claim-requests`)
      .then((res) => res.json())
      .then((data) => setClaimRequests(data))
      .catch(() =>
        Swal.fire("Error", "Failed to load requests.", "error")
      )
      .finally(() => setLoading(false));
  }, [id, selecting]);

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
        // Redireciona diretamente para o chat privado
        navigate(`/announcementDetails/${id}/private-chat`);
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

  // Botão para ir para o chat, visível só se donee já foi escolhido
  const handleGoToChat = () => {
    navigate(`/announcementDetails/${id}/private-chat`);
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
      {loading ? (
        <p>Loading...</p>
      ) : claimRequests.length === 0 ? (
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
                  style={{
                    marginTop: 10,
                    backgroundColor: "#C01722",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 20px",
                    fontWeight: "bold",
                    cursor: selecting ? "not-allowed" : "pointer",
                  }}
                  disabled={selecting}
                  onClick={() => handleSelect(req.userId)}
                >
                  Select as recipient
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Botão para ir para o chat, visível só se donee já foi escolhido */}
      {doneeId && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={handleGoToChat}
            style={{
              backgroundColor: "#C01722",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "12px 32px",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
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