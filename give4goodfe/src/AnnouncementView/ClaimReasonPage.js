import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ClaimReasonPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = sessionStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:8080/announcements/${id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, reason }),
      });

      if (!response.ok) {
        let errorMsg = "Error submitting the reason.";
        try {
          const data = await response.json();
          if (
            (typeof data.message === "string" && (
              data.message.toLowerCase().includes("já fizeste um pedido") ||
              (data.message.toLowerCase().includes("already") && data.message.toLowerCase().includes("claim"))
            ))
          ) {
            errorMsg = "You cannot submit more than one claim for the same announcement.";
          } else {
            errorMsg = data.message || data || errorMsg;
          }
        } catch {
          try {
            const txt = await response.text();
            if (
              typeof txt === "string" && (
                txt.toLowerCase().includes("já fizeste um pedido") ||
                (txt.toLowerCase().includes("already") && txt.toLowerCase().includes("claim"))
              )
            ) {
              errorMsg = "You cannot submit more than one claim for the same announcement.";
            } else {
              errorMsg = txt || errorMsg;
            }
          } catch {}
        }
        throw new Error(errorMsg);
      }

      Swal.fire({
        title: "Request submitted!",
        text: "Your reason has been submitted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/announcements");
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "Error submitting the reason.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", background: "#fff", padding: 32, borderRadius: 10 }}>
      <h2>Explain why you need this product</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={6}
          required
          placeholder="Describe the reason for your request"
          style={{ width: "100%", marginBottom: 16, borderRadius: 6, border: "1px solid #bbb", padding: 8 }}
        />
        <button
          type="submit"
          disabled={isSubmitting || !reason.trim()}
          style={{
            backgroundColor: "#C01722",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 32px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Sending..." : "Submit reason"}
        </button>
      </form>
    </div>
  );
}

export default ClaimReasonPage;