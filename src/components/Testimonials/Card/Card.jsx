import React from "react";
import PropTypes from "prop-types";
import "./Card.css";
import LeftQuote from "../../../assests/left_quote.png";
import UserIcon from "../../../assests/user-icon.png";

const Card = ({ title, text, tag }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-img">
          <img src={UserIcon} alt="user-img" />
        </div>

        <div className="card-data">
          <h2>{title}</h2>
          <p>{tag}</p>
        </div>

        <div className="card-icon">
          <img src={LeftQuote} alt="left_quote" />
        </div>
      </div>

      <div className="card-text">
        <p>{text}</p>
      </div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
};

export default Card;
