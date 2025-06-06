import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../css/HeroSection.css';

const HeroSection = () => {
  const words = ["better and safer.", "solidarity and connected.", "welcoming and generous.", "healthy and happy."];
  const [currentWord, setCurrentWord] = useState(words[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => {
        const currentIndex = words.indexOf(prev);
        const nextIndex = (currentIndex + 1) % words.length;
        return words[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [words]);

  const handleExploreClick = () => {
    navigate('/about-us');
  };

  return (
    <div className="hero-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Typography variant="h2" component="span">
          For a world   
          <motion.span key={currentWord} className="rotating-words" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {currentWord}
          </motion.span>
        </Typography>
      </motion.div>
      <motion.div className="donation-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
        Donation platform
      </motion.div>
      <Button className="hero-button" variant="contained" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} onClick={handleExploreClick}>
        Explore
      </Button>
    </div>
  );
};

export default HeroSection;
