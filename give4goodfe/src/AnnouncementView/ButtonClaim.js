import React from "react";
import { motion } from "framer-motion";
import Button from "@mui/material/Button";
import "./ButtonClaim.css";

const CustomButton = ({ handleExploreClick }) => {
  return (
    <Button
      className="claim-button"
      variant="contained"
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleExploreClick}
    >
      Claim
    </Button>
  );
};

export default CustomButton;