import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../css/MyAnnouncements.css';

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

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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

const AnnouncementCard = ({ id, title, category, imageUrl }) => {
  const navigate = useNavigate(); // Hook para navegação

  const handleEditClick = () => {
    navigate(`/edit-announcement/${id}`);
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
      <EditButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleEditClick}
      >
        Edit
      </EditButton>
    </Card>
  );
};

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/announcements/donor/${sessionStorage.getItem('userId')}`);
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    
    fetchData();
  }, []);

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
            onClick={() => navigate('/CreateAd')} // Navega para o formulário CreateAd
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
                id={announcement.id} // Passe o ID do anúncio
                title={announcement.product.name} 
                category={announcement.product.category} 
                imageUrl={announcement.product.photoUrl} // Use the photo URL from the API
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </CardGrid>
    </PageContainer>
  );
};

export default MyAnnouncements;
