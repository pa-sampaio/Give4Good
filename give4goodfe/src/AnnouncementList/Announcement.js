import React, { useState, useEffect } from 'react';
import AnnouncementCard from './AnnouncementCard';
import './Announcement.css';

function Announcements() {
  const [currentPage, setCurrentPage] = useState(1);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);
  const announcementsPerPage = 9;

  const URL = `http://localhost:8080/announcements/unclaimed/not-owned-by/${sessionStorage.getItem("userId")}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        setAnnouncements(data);
        setFetched(true); // Update the state to indicate that announcements have been fetched
      } catch (error) {
        setError(error.message);
      }
    };
    
    fetchData();
  }, [URL]); // Add URL as a dependency to useEffect

  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

  const isFirstPage = currentPage === 1;
  const isLastPage = indexOfLastAnnouncement >= announcements.length;

  return (
    <div>
      <div className="announcements">
        {currentAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
      <div className="navigation-buttons">
        <button className="navigation-button left-arrow" onClick={handlePrev} style={{ visibility: isFirstPage ? 'hidden' : 'visible' }}>
          &lt;
        </button>
        <button className="navigation-button right-arrow" onClick={handleNext} style={{ visibility: isLastPage ? 'hidden' : 'visible' }}>
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Announcements;
