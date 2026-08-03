import React from "react";

const StatCard = ({ icon, label, value, accent = "terracotta" }) => (
  <div className={`stat-card accent-${accent}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  </div>
);

export default StatCard;
