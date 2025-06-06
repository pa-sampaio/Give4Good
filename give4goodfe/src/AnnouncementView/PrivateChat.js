import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

/**
 * PrivateChat - Chat privado entre o donor e o donee selecionado para um anúncio.
 */
function PrivateChat({ announcementId: propAnnouncementId, userId: propUserId, recipientId: propRecipientId }) {
  const params = useParams();
  const announcementId = propAnnouncementId || params.id;
  const userId = propUserId || sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const [donorId, setDonorId] = useState(null);
  const [doneeId, setDoneeId] = useState(null);

  const [accessDenied, setAccessDenied] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch(`http://localhost:8080/announcements/${announcementId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        setDonorId(data.userDonorId);
        setDoneeId(data.userDoneeId);

        if (!(userId && (userId === data.userDonorId || userId === data.userDoneeId) && data.userDoneeId)) {
          setAccessDenied(true);
        } else {
          setAccessDenied(false);
        }
      } catch {
        setAccessDenied(true);
      }
    }
    fetchAnnouncement();
  }, [announcementId, userId]);

  useEffect(() => {
    if (accessDenied) return;
    async function fetchMessages() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/announcements/${announcementId}/messages`);
        if (res.status === 404) {
          setMessages([]);
        } else if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          throw new Error("Failed to fetch messages");
        }
      } catch {
        setMessages([]);
      }
      setLoading(false);
    }
    fetchMessages();
  }, [announcementId, accessDenied]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const msg = {
      senderId: userId,
      receiverId: (userId === donorId ? doneeId : donorId),
      content: newMsg,
      senderName: userName,
    };
    await fetch(`http://localhost:8080/announcements/${announcementId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
    setMessages((msgs) => [
      ...msgs,
      {
        ...msg,
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMsg("");
  };

  if (accessDenied) {
    return (
      <div style={{ color: "#C01722", padding: 20, textAlign: "center", fontWeight: "bold" }}>
        Private chat is only available for the donor and the selected donee.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: 8,
        padding: 16,
        maxWidth: 500,
        margin: "2rem auto",
        boxSizing: "border-box"
      }}
    >
      <h3 style={{ marginBottom: 18 }}>Private Chat</h3>
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          marginBottom: 14,
          border: "1px solid #eee",
          borderRadius: 6,
          padding: 8,
          background: "#fff",
          boxSizing: "border-box"
        }}
      >
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.senderId === userId ? "right" : "left",
                marginBottom: 6
              }}
            >
              <span style={{ fontWeight: "bold", color: "#C01722" }}>
                {msg.senderName || (msg.senderId === userId ? userName : "Recipient")}:
              </span>{" "}
              <span>{msg.content}</span>
              <div style={{ fontSize: 10, color: "#888" }}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 8,
          width: "100%"
        }}
      >
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          style={{
            borderRadius: 4,
            border: "1px solid #bbb",
            padding: 8,
            fontSize: 15,
            flex: 1,
            boxSizing: "border-box"
          }}
        />
        <button
          type="submit"
          style={{
            borderRadius: "50%",
            background: "#C01722",
            color: "#fff",
            border: "none",
            width: 38,
            height: 38,
            minWidth: 38,
            minHeight: 38,
            fontWeight: "bold",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: newMsg.trim() ? "pointer" : "not-allowed",
            opacity: newMsg.trim() ? 1 : 0.7,
            transition: "opacity 0.2s",
            marginLeft: 2
          }}
          disabled={!newMsg.trim()}
          aria-label="Send message"
          title="Send"
        >
          {/* Ícone de enviar (SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3.4 20.6l17.2-8.6c.7-.4.7-1.6 0-2L3.4 1.4C2.8 1.1 2 1.6 2 2.3v19.4c0 .7.8 1.2 1.4.9zm1.6-2.6V6l12.2 6-12.2 6z"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default PrivateChat;