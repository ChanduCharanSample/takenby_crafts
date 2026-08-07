import React from "react";
import { Link } from "react-router-dom";

const StatCard = ({ icon, label, value, accent = "terracotta", linkTo }) => {
  const inner = (
    <>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </>
  );
  if (linkTo) {
    return (
      <Link to={linkTo} className={`stat-card stat-card-link accent-${accent}`}>
        {inner}
      </Link>
    );
  }
  return <div className={`stat-card accent-${accent}`}>{inner}</div>;
};

export default StatCard;
