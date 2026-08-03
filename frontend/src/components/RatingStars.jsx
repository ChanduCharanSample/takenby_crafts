import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingStars = ({ rating = 0, count = 0, size = 14 }) => {
  const value = Number(rating) || 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<FaStar key={i} color="#c9a227" size={size} />);
    } else if (value >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} color="#c9a227" size={size} />);
    } else {
      stars.push(<FaRegStar key={i} color="#c9a227" size={size} />);
    }
  }
  return (
    <span className="rating-stars">
      {stars}
      {count !== undefined && count > 0 && (
        <span className="rating-count">({count})</span>
      )}
    </span>
  );
};

export default RatingStars;
