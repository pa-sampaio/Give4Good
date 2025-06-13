import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import '../css/Header.css';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAccountAnchorEl(null);
    setProfileAnchorEl(null);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    handleClose();
    navigate('/');
  };

  const isLoggedIn = !!sessionStorage.getItem('userName');
  const userName = sessionStorage.getItem('userName');
  const userRole = sessionStorage.getItem('userRole');
  const userId = sessionStorage.getItem('userId');

  // Only show chat menu if donor or donee is logged in
  const canShowChatMenu =
    isLoggedIn &&
    (userRole === 'donor' || userRole === 'donee');

  // Handler para o botão de chat
  const handleChatClick = async () => {
    if (userRole === "donee") {
      // Vai buscar o(s) anúncio(s) onde este user é o donee aceite
      try {
        const response = await fetch(`http://localhost:8080/announcements/donee/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch assigned announcements");
        const data = await response.json();
        // Se tiver anúncios aceites, vai para o chat do primeiro (ou podes mostrar escolha)
        if (data && data.length > 0) {
          // Preferencialmente, vai para o mais recente:
          const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          const announcementId = sorted[0].id;
          navigate(`/announcementDetails/${announcementId}/private-chat`);
        } else {
          // Não tem anúncio aceite
          alert("You have not been accepted to any announcement yet.");
        }
      } catch (err) {
        alert("Failed to fetch your accepted announcements.");
      }
    } else if (userRole === "donor") {
      // Para donor, podes mostrar uma página de escolha (ex: /my-announcements)
      navigate("/my-announcements");
    }
  };

  return (
    <AppBar position="static" className="styled-app-bar">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <motion.div
          className="brand-typography"
          onClick={handleLogoClick}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, duration: 0.3 }}
        >
          Give4Good
        </motion.div>

        <div style={{ display: 'flex', gap: '10px', marginRight: '2rem', marginLeft: 'auto' }}>
          <Button
            component={Link}
            to="/"
            className={`header-link ${location.pathname === '/' ? 'header-link-active' : ''}`}
          >
            {capitalizeFirstLetter('home')}
          </Button>
          <Button
            component={Link}
            to="/about-us"
            className={`header-link ${location.pathname === '/about-us' ? 'header-link-active' : ''}`}
          >
            {capitalizeFirstLetter('about us')}
          </Button>
          <Button
            aria-controls="announcements-menu"
            aria-haspopup="true"
            onClick={handleClick}
            endIcon={<ArrowDropDownIcon />}
            className={`header-link ${(location.pathname.startsWith('/announcements') || location.pathname === '/my-announcements' || location.pathname === '/my-claims') ? 'header-link-active' : ''}`}
          >
            {capitalizeFirstLetter('announcements')}
          </Button>
          <Menu
            id="announcements-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            className="styled-menu"
          >
            <MenuItem component={Link} to="/announcements" onClick={handleClose} className="styled-menu-item">
              {capitalizeFirstLetter('all announcements')}
            </MenuItem>
            <MenuItem component={Link} to="/my-announcements" onClick={handleClose} className="styled-menu-item">
              {capitalizeFirstLetter('my announcements')}
            </MenuItem>
            <MenuItem component={Link} to="/my-claims" onClick={handleClose} className="styled-menu-item">
              {capitalizeFirstLetter('my claims')}
            </MenuItem>
          </Menu>
          {canShowChatMenu && (
            <Button
              component={Link}
              to="/private-chat"
              className={`header-link ${location.pathname === '/private-chat' ? 'header-link-active' : ''}`}
            >
              {capitalizeFirstLetter('chat')}
            </Button>
          )}
        </div>

        <div>
          {isLoggedIn ? (
            <>
              <Button
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={handleProfileClick}
                endIcon={<ArrowDropDownIcon />}
                className="header-link"
              >
                {userName}
              </Button>
              <Menu
                id="profile-menu"
                anchorEl={profileAnchorEl}
                keepMounted
                open={Boolean(profileAnchorEl)}
                onClose={handleClose}
                className="styled-menu"
              >
                <MenuItem component={Link} to="/edit-profile" onClick={handleClose} className="styled-menu-item">
                  {capitalizeFirstLetter('edit profile')}
                </MenuItem>
                <MenuItem component={Link} to="/forgot-password" onClick={handleClose} className="styled-menu-item">
                  {capitalizeFirstLetter('forgot password')}
                </MenuItem>
                <MenuItem onClick={handleLogout} className="styled-menu-item">
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                aria-controls="account-menu"
                aria-haspopup="true"
                onClick={handleAccountClick}
                endIcon={<ArrowDropDownIcon />}
                className={`header-link ${location.pathname === '/account' ? 'header-link-active' : ''}`}
              >
                {capitalizeFirstLetter('account')}
              </Button>
              <Menu
                id="account-menu"
                anchorEl={accountAnchorEl}
                keepMounted
                open={Boolean(accountAnchorEl)}
                onClose={handleClose}
                className="styled-menu"
              >
                <MenuItem component={Link} to="/announcementLogin" onClick={handleClose} className="styled-menu-item">
                  {capitalizeFirstLetter('sign in')}
                </MenuItem>
                <MenuItem component={Link} to="/sign-up" onClick={handleClose} className="styled-menu-item">
                  {capitalizeFirstLetter('sign up')}
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;