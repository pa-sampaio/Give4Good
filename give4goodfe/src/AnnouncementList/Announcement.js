import React, { useState, useEffect } from 'react';
import AnnouncementCard from './AnnouncementCard';
import './Announcement.css';

function Announcements() {
  const [currentPage, setCurrentPage] = useState(1);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const announcementsPerPage = 9;

  // Monta a URL incluindo search se necessário
  const userId = sessionStorage.getItem("userId");
  const baseURL = `http://localhost:8080/announcements/unclaimed/not-owned-by/${userId}`;
  const URL = searchValue
    ? `${baseURL}?search=${encodeURIComponent(searchValue)}`
    : baseURL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        setAnnouncements(data);
        setFetched(true);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchData();
  }, [URL]);

  const handleNext = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrev = () => setCurrentPage((prevPage) => prevPage - 1);

  // Pesquisa ao pressionar Enter ou clicar na lupa
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchValue(search);
    setCurrentPage(1);
  };

  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

  const isFirstPage = currentPage === 1;
  const isLastPage = indexOfLastAnnouncement >= announcements.length;

  return (
    <div>
      <div className="search-container">
        {!showSearch ? (
          <button
            className="search-icon-button"
            onClick={() => setShowSearch(true)}
            aria-label="Mostrar pesquisa"
          >
            🔍
          </button>
        ) : (
          <form className="search-bar-revealed" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Pesquisar anúncios..."
              className="search-input"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="search-icon-button"
              aria-label="Pesquisar"
              type="submit"
            >
              🔍
            </button>
          </form>
        )}
      </div>
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