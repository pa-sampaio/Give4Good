import React, { useEffect, useRef } from 'react';
import { Container, Typography, Paper, Grid, Box } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { Favorite, People, EmojiObjects, Recycling, Public, Visibility } from '@mui/icons-material';
import '../css/AboutUs.css';

const AboutUs = () => {
  const controls = useAnimation();
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current; // Captura a referência atual
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold: 0.5 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [controls]);

  const features = [
    { icon: <Favorite fontSize="large" />, label: "Variaty of donations", description: "Due to having multiple donors, a variety of products will be available." },
    { icon: <People fontSize="large" />, label: "Engaged Community", description: "We promote interaction between donors and beneficiaries." },
    { icon: <EmojiObjects fontSize="large" />, label: "Social Innovation", description: "Blockchain for transparent donation tracking." },
    { icon: <Recycling fontSize="large" />, label: "Sustainability", description: "Recycling and upcycling, don't throw away the things you dont use anymore." },
    { icon: <Public fontSize="large" />, label: "Global Impact", description: "Our platform will contribute to global impact by reducing waste, thereby benefiting the world." },
    { icon: <Visibility fontSize="large" />, label: "Total Transparency", description: "Every aspect of the project is open and accessible, promoting trust among stakeholders." },
  ];

  const floatingIcons = ['❤️', '🌍', '🤝', '💡', '🎁', '🌱'];

  return (
    <Container maxWidth={false} className="about-container">
      <Paper elevation={3} className="white-box">
        <Box
          ref={ref}
          component={motion.div}
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 }
          }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, color: '#FF0000', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
              Revolutionizing Digital Solidarity
            </Typography>
          </motion.div>

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#333333', textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px' }}>
              Give4Good is not just a donation platform. It's a movement for social transformation. We use cutting-edge technology to create an efficient and transparent solidarity ecosystem, where every action generates measurable and lasting impact.
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.05, rotate: [0, 5, -5, 0] }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={controls}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 }
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="feature-box"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {feature.icon}
                  </motion.div>
                  <Typography variant="h6" sx={{ my: 2, color: '#FF0000' }}>{feature.label}</Typography>
                  <Typography variant="body2" sx={{ color: '#333333' }}>{feature.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            component={motion.div}
            className="motivational-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, scale: 1 },
              hidden: { opacity: 0, scale: 0.9 }
            }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {floatingIcons.map((icon, index) => (
              <motion.div
                className="floating-icon"
                key={index}
                initial={{ x: `${Math.random() * 100}%`, y: '100%' }}
                animate={{
                  y: ['-100%', '100%'],
                  x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  rotate: [0, 360],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                  delay: index * 0.5,
                }}
              >
                {icon}
              </motion.div>
            ))}
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, position: 'relative', zIndex: 1 }}>
                "Together, we can create a world of endless possibilities."
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
            >
              <Typography variant="h6" sx={{ position: 'relative', zIndex: 1 }}>
                Join us in making a difference, one act of kindness at a time.
              </Typography>
            </motion.div>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutUs;
