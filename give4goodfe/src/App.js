import { Route, Routes } from 'react-router-dom';
import './App.css';
import Announcement from './AnnouncementList/Announcement';
import { CssBaseline } from '@mui/material';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import MyAnnouncements from './components/MyAnnouncements';
import SignUp from './components/SignUp';
import React from "react";
import "./App.css";
import Card from "./AnnouncementView/Card.js";
import Login from "./Account/Login/Login.js";
import CreateAd from "./AnnouncementCreat/Edit/CreateAd.js";
import EditAd from "./AnnouncementCreat/Edit/EditAd.js";
import ConfirmEmail from './components/ConfirmEmail.js';
import ForgotPassword from './components/ForgotPassword.js';
import VerifyCode from './components/VerifyCode.js';
import ResetPassword from './components/ResetPassword.js';
import EditProfile from './components/EditProfile';
import ClaimReasonPage from "./AnnouncementView/ClaimReasonPage";
import ClaimRequestsListPage from './AnnouncementView/ClaimRequestListPage.js';
import PrivateChat from './AnnouncementView/PrivateChat.js';
import DoneeChatsPage from './AnnouncementView/DoneeChatsPage.js';

function App() {
  return (
    <>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/my-announcements" element={<MyAnnouncements />} />
        <Route path="/announcements" element={<Announcement />} />
        <Route path="/announcementDetails/:id" element={<Card />} />
        <Route path="/announcementDetails/:id/claim-reason" element={<ClaimReasonPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/announcementLogin" element={<Login />} />
        <Route path="/CreateAd" element={<CreateAd />} />
        <Route path="/edit-announcement/:id" element={<EditAd />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/announcementDetails/:id/claim-requests" element={<ClaimRequestsListPage />} />
        <Route path="/announcementDetails/:id/private-chat" element={<PrivateChat />} />
        <Route path="/private-chat" element={<DoneeChatsPage />} />
      </Routes>
    </>
  );
}

export default App;