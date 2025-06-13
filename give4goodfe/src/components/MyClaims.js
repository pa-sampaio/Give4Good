import React, { useEffect, useState } from "react";
import AnnouncementCard from "../AnnouncementList/AnnouncementCard";

function MyClaims() {
  const [myClaims, setMyClaims] = useState([]);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;
    const fetchMyClaims = async () => {
      try {
        const response = await fetch(`http://localhost:8080/announcements/users/${userId}/claims`);
        if (!response.ok) throw new Error("Erro ao buscar claims");
        const data = await response.json();
        setMyClaims(data || []);
      } catch (err) {
        setMyClaims([]);
      }
    };
    fetchMyClaims();
  }, [userId]);

  return (
    <div style={{ padding: 32 }}>
      <h1>My claims</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        {myClaims.length === 0 ? (
          <p>You haven't claimed any announcement yet.</p>
        ) : (
          myClaims.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  );
}

export default MyClaims;