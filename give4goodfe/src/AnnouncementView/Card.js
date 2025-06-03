import React, { useState, useEffect } from "react";
import CustomButton from "./ButtonClaim";
import BackButton from "./ButtonBack";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom"; 
import "./Card.css";

function Card({ onClose }) {
  const { id } = useParams(); 
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [announcementDetailsName, setAnnouncementName] = useState(null);
  const [announcementDetailsCategory, setAnnouncementCategory] = useState(null);
  const [announcementDetailsDescription, setAnnouncementDescription] = useState(null);
  const [announcementDetailsImage, setAnnouncementDetailsImage] = useState(null);
  const [error, setError] = useState(null);
  const userDoneeId = sessionStorage.getItem("userId");

  // Comments states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleClaim = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/announcements/${id}/userDonee/${userDoneeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
      Swal.fire({
        title: "Success!",
        text: "This product has been claimed successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false, 
        allowEscapeKey: false,    
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/announcements");
        }
      });
    } catch (error) {
      console.error("There was an error!", error);
      setError(error.message);
      Swal.fire({
        title: "Error!",
        text: "There was a problem while claiming this product.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  };

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/announcements/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnnouncementName(data.product.name);
        setAnnouncementCategory(data.product.category);
        setAnnouncementDescription(data.product.description);
        setAnnouncementDetailsImage(data.product.photoUrl);
      } catch (error) {
        console.error("Error fetching announcement details:", error);
        setError(error.message);
        Swal.fire({
          title: "Error!",
          text: "There was a problem fetching the announcement details.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "confirm-button",
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      }
    };

    fetchAnnouncementDetails();
  }, [id]);

  // Fetch comments only when showComments is true
  useEffect(() => {
    if (!showComments) return;
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const response = await fetch(`http://localhost:8080/announcements/${id}/comments`);
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
        const data = await response.json();
        setComments(data);
      } catch (err) {
        setComments([]);
      }
      setLoadingComments(false);
    };

    fetchComments();
  }, [id, showComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const response = await fetch(`http://localhost:8080/announcements/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userDoneeId,
          content: newComment,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }
      const comment = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Failed to submit your comment.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    setSubmittingComment(false);
  };

  return (
    <div className="card-container">
      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-image">
              {announcementDetailsImage ? (
                <img src={announcementDetailsImage} alt="Announcement" />
              ) : (
                <div className="image-placeholder">No Image Available</div>
              )}
            </div>
          </div>
          <div className="card-text">
            <div className="text-and-button">
              <div className="text-container">
                <h1 className="card-title">{announcementDetailsName}</h1>
                <h2 className="card-category">{announcementDetailsCategory}</h2>
                <p className="card-description">
                  {announcementDetailsDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-navigation-Buttons">
          <div className="left-arrow-details">
            <BackButton text="back" />
          </div>
          <div className="card-navigation">
            <CustomButton handleExploreClick={handleClaim} />
          </div>
        </div>
        {/* Toggle Comments Button */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            className="toggle-comments-btn"
            onClick={() => setShowComments((show) => !show)}
          >
            {showComments ? "Hide Comments" : "View Comments"}
          </button>
        </div>
        {/* Comments Section at the bottom, only if showComments */}
        {showComments && (
          <div className="card-comments-section">
            <h3>Comments</h3>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : (
              <ul className="card-comments-list">
                {comments.length === 0 && <li>No comments yet.</li>}
                {comments.map((comment, idx) => (
                  <li key={comment.id || idx} className="card-comment-item">
                    <strong>{comment.username || "User"}:</strong> {comment.content}
                  </li>
                ))}
              </ul>
            )}
            <form className="card-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="card-comment-textarea"
                disabled={submittingComment}
              />
              <button
                type="submit"
                className="card-comment-submit"
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? "Sending..." : "Comment"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;