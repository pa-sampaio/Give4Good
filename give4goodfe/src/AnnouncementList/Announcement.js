import React, { useState, useEffect, useRef } from 'react';
import AnnouncementCard from './AnnouncementCard';
import './Announcement.css';
import { useLoading } from '../contexts/LoadingContext';

function Announcements() {
  const [currentPage, setCurrentPage] = useState(1);
  const [announcements, setAnnouncements] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const announcementsPerPage = 9;
  const { setLoading } = useLoading();
  const isMounted = useRef(true);

  // Delay helper
  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // Carrega categorias (SEM mexer no loading global)
  useEffect(() => {
    fetch('http://localhost:8080/announcements/categories')
      .then(res => res.json())
      .then(data => isMounted.current && setCategories(Array.isArray(data) ? data : []))
      .catch(() => isMounted.current && setCategories([]));
  }, []);

  // Monta a URL incluindo search/category se necessário
  const userId = sessionStorage.getItem("userId");
  let baseURL = `http://localhost:8080/announcements/unclaimed/not-owned-by/${userId}`;
  let urlParams = [];
  if (searchValue) urlParams.push(`search=${encodeURIComponent(searchValue)}`);
  if (category) urlParams.push(`category=${encodeURIComponent(category)}`);
  const URL = urlParams.length ? `${baseURL}?${urlParams.join("&")}` : baseURL;

  // Loader: desaparece mesmo que haja 0 anúncios!
  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    async function fetchWithRetry() {
      setLoading(true);
      while (!cancelled) {
        try {
          const response = await fetch(URL, { method: "GET" });
          if (!response.ok) throw new Error("Server error");
          const data = await response.json();

          if (isMounted.current) {
            setAnnouncements(data);
            // Loader desaparece após qualquer resposta válida!
            setLoading(false);
            break;
          }
        } catch (err) {
          await sleep(2000);
        }
      }
    }

    fetchWithRetry();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
    // eslint-disable-next-line
  }, [URL, setLoading]);

  const handleNext = () => setCurrentPage((prevPage) => prevPage + 1);
  const handlePrev = () => setCurrentPage((prevPage) => prevPage - 1);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchValue(search);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);

  const isFirstPage = currentPage === 1;
  const isLastPage = indexOfLastAnnouncement >= announcements.length;

  return (
    <div>
      <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {!showSearch ? (
          <button
            className="search-icon-button"
            onClick={() => setShowSearch(true)}
            aria-label="Mostrar pesquisa"
          >
            🔍
          </button>
        ) : (
          <form className="search-bar-revealed" onSubmit={handleSearch} style={{ marginBottom: 0 }}>
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
        <select
          value={category}
          onChange={handleCategoryChange}
          className="category-filter-select"
          style={{
            padding: '6px 18px', borderRadius: 6, border: '1px solid #bbb', fontSize: 16, marginLeft: 8
          }}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
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