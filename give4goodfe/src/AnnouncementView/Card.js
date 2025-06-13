import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import PrivateChat from "./PrivateChat"; 

const styles = `
.card-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #f7f7f7;
  padding: 40px 0;
}
.card {
  background-color: #fff;
  width: 900px;
  max-width: 98vw;
  min-height: 88vh;
  max-height: 95vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 50px 20px rgba(192, 23, 34, 0.08);
  padding: 36px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  align-self: center;
  box-sizing: border-box;
}
.card-content {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex: 1 1 auto;
}
.card-header {
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-image {
  width: 250px;
  height: 200px;
  max-width: 250px;
  max-height: 200px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f2f2;
  border-radius: 24px;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e2e2;
  border-radius: 24px;
  color: #aaa;
  font-size: 1rem;
}
.card-text {
  width: 100%;
  margin-left: 40px;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-title {
  font-size: 28px;
  color: #C01722;
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.card-category {
  font-size: 18px;
  color: #CB5C63;
  margin-bottom: 1rem;
  font-weight: 500;
}
.card-description {
  font-size: 16px;
  color: #555;
  line-height: 1.7;
  font-weight: 400;
  margin-bottom: 0;
}
.card-navigation-Buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
}
.left-arrow-details {
  display: flex;
  align-items: center;
  color: #7e7e7e;
  margin-left: 8px;
  cursor: pointer;
  font-size: 24px;
  font-weight: normal;
  transition: color 0.2s;
}
.left-arrow-details:hover {
  color: #C01722;
}
.card-navigation {
  display: flex;
  align-items: center;
}
.confirm-button {
  background-color: #C01722 !important;
  color: #fff !important;
  border-radius: 8px !important;
  font-weight: 500;
  letter-spacing: 0.5px;
}
/* Aumentar o campo de comentários */
.card-comments-section {
  margin-top: 32px;
  background: #f3f3f3;
  border-radius: 10px;
  padding: 18px;
  max-height: 700px;
  min-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(192, 23, 34, 0.05);
}
.card-comments-section h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #C01722;
  margin-bottom: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.card-comments-list {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 520px;
}
.card-comment-item {
  margin-bottom: 5px;
  font-size: 0.97rem;
  color: #444;
  background: #fff;
  border-radius: 4px;
  padding: 4px 8px;
}
.card-comment-form {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.card-comment-textarea {
  resize: vertical;
  min-height: 32px;
  max-height: 120px;
  padding: 7px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #bbb;
  color: #333;
  background: #fff;
  font-family: inherit;
}
.card-comment-submit {
  align-self: flex-end;
  padding: 6px 16px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  background: #C01722;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: background 0.2s;
}
.card-comment-submit:disabled {
  background: #bbb;
  cursor: not-allowed;
}
.toggle-comments-btn {
  padding: 8px 20px;
  font-size: 1rem;
  border-radius: 6px;
  border: none;
  background: #C01722;
  color: #fff;
  cursor: pointer;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: background 0.2s;
}
.toggle-comments-btn:hover {
  background: #a0121c;
}
.claim-button{
  background-color: #C01722 !important;
  color: white ;
  font-weight: bold !important;
  font-size: 14px !important;
  border: none;
  padding: 8px 30px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: flex-end !important;
}
`;

function injectStyles(styles) {
  if (!document.getElementById('cardjs-inline-styles')) {
    const style = document.createElement('style');
    style.id = 'cardjs-inline-styles';
    style.innerHTML = styles;
    document.head.appendChild(style);
  }
}

const BackButton = ({ text = "back" }) => {
  const navigate = useNavigate();
  return (
    <span
      className="left-arrow-details"
      onClick={() => navigate('/announcements')}
    >
      &lt; {text}
    </span>
  );
};

const CustomButton = ({ handleExploreClick }) => {
  return (
    <Button
      className="claim-button"
      variant="contained"
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleExploreClick}
    >
      Claim
    </Button>
  );
};

function Card({ onClose }) {
  useEffect(() => {
    injectStyles(styles);
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [announcementDetailsName, setAnnouncementName] = useState(null);
  const [announcementDetailsCategory, setAnnouncementCategory] = useState(null);
  const [announcementDetailsDescription, setAnnouncementDescription] = useState(null);
  const [announcementDetailsImage, setAnnouncementDetailsImage] = useState(null);
  const [announcementDonorId, setAnnouncementDonorId] = useState(null);
  const [announcementDoneeId, setAnnouncementDoneeId] = useState(null);
  const [error, setError] = useState(null);

  const userId = sessionStorage.getItem("userId");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleClaim = (event) => {
    event.preventDefault();
    navigate(`/announcementDetails/${id}/claim-reason`);
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
        setAnnouncementDonorId(data.userDonorId || data.donorId || null);
        setAnnouncementDoneeId(data.userDoneeId || null);
      } catch (error) {
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

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:8080/announcements/${id}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setComments([]);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    if (showComments) fetchComments();
    // eslint-disable-next-line
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
          userId: userId,
          content: newComment,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }
      setNewComment("");
      await fetchComments(); 
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

  const canShowPrivateChat = (userId && (userId === announcementDonorId || userId === announcementDoneeId)) && announcementDoneeId;

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
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            className="toggle-comments-btn"
            onClick={() => setShowComments((show) => !show)}
          >
            {showComments ? "Hide Comments" : "View Comments"}
          </button>
        </div>
        {showComments && (
          <div className="card-comments-section">
            <h3>Comments</h3>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : (
              <ul className="card-comments-list">
                {comments.length === 0 && <li>No comments yet.</li>}
                {comments.map((comment, idx) => (
                  <li key={comment.id || comment._id || idx} className="card-comment-item">
                    <strong>{comment.username || comment.userName || "User"}:</strong> {comment.content}
                  </li>
                ))}
              </ul>
            )}
            <form className="card-comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
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
        {canShowPrivateChat && (
          <PrivateChat
            announcementId={id}
            userId={userId}
            recipientId={userId === announcementDonorId ? announcementDoneeId : announcementDonorId}
          />
        )}
      </div>
    </div>
  );
}

export default Card;