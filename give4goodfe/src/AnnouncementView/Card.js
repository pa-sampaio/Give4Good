import React, { useState, useEffect } from "react";
import CustomButton from "./ButtonClaim";
import BackButton from "./ButtonBack";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import "./Card.css";

function Card({ onClose }) {
  const { id } = useParams(); // Pega o ID do anúncio a partir da URL
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [announcementDetailsName, setAnnouncementName] = useState(null);
  const [announcementDetailsCategory, setAnnouncementCategory] = useState(null);
  const [announcementDetailsDescription, setAnnouncementDescription] = useState(null);
  const [announcementDetailsImage, setAnnouncementDetailsImage] = useState(null);
  const [error, setError] = useState(null);
  const userDoneeId = sessionStorage.getItem("userId"); // Pega o ID do usuário da sessionStorage

  const handleClaim = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/announcements/${id}/userDonee/${userDoneeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
      Swal.fire({
        title: "Success!",
        text: "This product has been claimed with success!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false, 
        allowEscapeKey: false,    
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/announcements");
        }
      });
    } catch (error) {
      console.error("There was an error!", error);
      setError(error.message);
      Swal.fire({
        title: "Error!",
        text: "There was a problem while claiming this product.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  };

  useEffect(() => {
    const fetchAnnouncementDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/announcements/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnnouncementName(data.product.name);
        setAnnouncementCategory(data.product.category);
        setAnnouncementDescription(data.product.description);
        setAnnouncementDetailsImage(data.product.photoUrl);
      } catch (error) {
        console.error("Error fetching announcement details:", error);
        setError(error.message);
        Swal.fire({
          title: "Error!",
          text: "There was a problem while fetching the announcement details.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "confirm-button",
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      }
    };

    fetchAnnouncementDetails();
  }, [id]);

  return (
    <div className="card-container">
      <div className="card">
        <div className="card-content">
          <div className="card-header">
            <div className="card-image">
              {announcementDetailsImage ? (
                <img src={announcementDetailsImage} alt="Announcement" />
              ) : (
                <div className="image-placeholder">No Image Available</div>
              )}
            </div>
          </div>
          <div className="card-text">
            <div className="text-and-button">
              <div className="text-container">
                <h1 className="card-title">{announcementDetailsName}</h1>
                <h2 className="card-category">{announcementDetailsCategory}</h2>
                <p className="card-description">
                  {announcementDetailsDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card-navigation-Buttons">
          <div className="left-arrow-details">
            <BackButton text="back" />
          </div>
          <div className="card-navigation">
            <CustomButton handleExploreClick={handleClaim} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
