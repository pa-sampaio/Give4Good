import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../css/MyAnnouncements.css';
import { useLoading } from '../contexts/LoadingContext';

// Animation keyframes
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const PageContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-size: 400% 400%;
  animation: ${gradientAnimation} 15s ease infinite;
`;

const Title = styled(motion.h1)`
  color: #c51d23;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  cursor: default;
  animation: ${floatAnimation} 3s ease-in-out infinite;
`;

const CardGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  justify-content: center;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
`;

const NewAnnouncementCard = styled(Card)`
  justify-content: center;
  cursor: pointer;
  background: linear-gradient(135deg, #f8f8f8, #e6e6e6);
  position: relative;
  overflow: hidden;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  border: 2px solid #d0d0d0;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(45deg);
    transition: all 0.5s ease;
    opacity: 0;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const PlusIcon = styled(motion.div)`
  font-size: 4rem;
  color: #c51d23;
  margin-bottom: 1rem;
  animation: ${pulseAnimation} 2s infinite;
`;

const CardImage = styled(motion.img)`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 2px solid #f0f0f0;
`;

const CardTitle = styled(motion.h2)`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const CardCategory = styled(motion.p)`
  color: #666;
  margin-bottom: 1rem;
`;

const EditButton = styled(motion.button)`
  background-color: #c51d23;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 5px;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }

  &:hover::after {
    animation: ripple 1s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(20, 20);
      opacity: 0;
    }
  }

  &:hover {
    background-color: #a5171d;
  }
`;

const ManageClaimsButton = styled(motion.button)`
  background-color: #c51d23;
  color: white;
  border: none;
  padding: 0.5rem 1.7rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 0.5rem;
  margin-top: 0.5rem;
  transition: background-color 0.3s ease, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(192, 23, 34, 0.07);

  &:hover {
    background-color: #a5171d;
    box-shadow: 0 4px 16px rgba(192, 23, 34, 0.18);
  }
`;

const CommentsSection = styled.div`
  width: 100%;
  background: #f3f3f3;
  border-radius: 10px;
  padding: 14px;
  margin-top: 18px;
  max-height: 220px;
  min-height: 80px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const CommentsTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #C01722;
`;

const CommentsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0 0;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 100px;
`;

const CommentItem = styled.li`
  margin-bottom: 6px;
  font-size: 0.97rem;
  color: #444;
  background: #fff;
  border-radius: 4px;
  padding: 4px 8px;
`;

const statusOrder = ["available", "sent", "unavailable"];
const getStatusColor = (status) => {
  if (status === "available") return "#4caf50";      // green
  if (status === "sent") return "#ffb300";           // yellow
  if (status === "unavailable") return "#c51d23";    // red
  return "#bbb";
};

const StatusBadge = ({ status, onClick, clickable }) => (
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
      marginRight: 8,
      cursor: clickable ? 'pointer' : 'default',
      userSelect: 'none',
      border: clickable ? '2px solid #bdbdbd' : 'none',
      boxShadow: clickable ? '0 0 4px rgba(0,0,0,0.08)' : 'none',
      transition: 'background 0.2s'
    }}
    onClick={clickable ? onClick : undefined}
    title={clickable ? "Click to change status" : ""}
  >
    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Available"}
  </span>
);

const AnnouncementCard = ({
  id,
  title,
  category,
  imageUrl,
  comments,
  hasClaims,
  status: initialStatus = "available"
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(initialStatus);

  // Detect if this is your own announcement (show status as clickable)
  // You can adjust this logic if you want to allow only the donor to change status
  const isOwner = true; // Change logic if needed

  const handleEditClick = () => {
    navigate(`/edit-announcement/${id}`);
  };

  const handleManageClaims = () => {
    navigate(`/announcementDetails/${id}/claim-requests`);
  };

  // handle status badge click
  const handleStatusBadgeClick = async () => {
    const currentIdx = statusOrder.indexOf(status);
    const nextStatus = statusOrder[(currentIdx + 1) % statusOrder.length];
    setStatus(nextStatus);
    await fetch(`http://localhost:8080/announcements/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
  };

  return (
    <Card
      whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <CardImage
        src={imageUrl}
        alt={title}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      <CardTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </CardTitle>
      <CardCategory
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {category}
      </CardCategory>

      {/* Status badge (clickable for donor/owner) */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <StatusBadge status={status} onClick={isOwner ? handleStatusBadgeClick : undefined} clickable={isOwner} />
      </div>

      <EditButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleEditClick}
      >
        Edit
      </EditButton>
      {hasClaims && (
        <ManageClaimsButton
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleManageClaims}
        >
          Manage Claims
        </ManageClaimsButton>
      )}
      <CommentsSection>
        <CommentsTitle>Comments</CommentsTitle>
        <CommentsList>
          {(comments || []).length === 0 && <CommentItem>No comments yet.</CommentItem>}
          {(comments || []).map((comment, idx) => (
            <CommentItem key={comment.id || idx}>
              <strong>{comment.username || "User"}:</strong> {comment.content}
            </CommentItem>
          ))}
        </CommentsList>
      </CommentsSection>
    </Card>
  );
};

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState({}); // {announcementId: [comments]}
  const [claims, setClaims] = useState({}); // {announcementId: [claimRequests]}
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
          const response = await fetch(`http://localhost:8080/announcements/donor/${sessionStorage.getItem('userId')}`);
          if (!response.ok) throw new Error();
          const data = await response.json();
          if (isMounted.current) {
            setAnnouncements(data);

            // Fetch comments and claims for each announcement in parallel
            const commentsObj = {};
            const claimsObj = {};
            await Promise.all(
              data.map(async (announcement) => {
                try {
                  const resCom = await fetch(`http://localhost:8080/announcements/${announcement.id}/comments`);
                  if (resCom.ok) {
                    commentsObj[announcement.id] = await resCom.json();
                  } else {
                    commentsObj[announcement.id] = [];
                  }
                } catch {
                  commentsObj[announcement.id] = [];
                }
                try {
                  const resClaims = await fetch(`http://localhost:8080/announcements/${announcement.id}/claim-requests`);
                  if (resClaims.ok) {
                    claimsObj[announcement.id] = await resClaims.json();
                  } else {
                    claimsObj[announcement.id] = [];
                  }
                } catch {
                  claimsObj[announcement.id] = [];
                }
              })
            );
            setComments(commentsObj);
            setClaims(claimsObj);

            // Loader desaparece mesmo se vier array vazio
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
  }, [setLoading]);

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.05, color: '#a5171d' }}
      >
        My announcements
      </Title>
      <CardGrid>
        <AnimatePresence>
          <NewAnnouncementCard
            whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate('/CreateAd')}
          >
            <PlusIcon
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              +
            </PlusIcon>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create a new announcement
            </motion.p>
          </NewAnnouncementCard>
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            >
              <AnnouncementCard
                id={announcement.id}
                title={announcement.product.name}
                category={announcement.product.category}
                imageUrl={announcement.product.photoUrl}
                comments={comments[announcement.id] || []}
                hasClaims={!!(claims[announcement.id] && claims[announcement.id].length > 0)}
                status={announcement.status}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardGrid>
    </PageContainer>
  );
};

export default MyAnnouncements;