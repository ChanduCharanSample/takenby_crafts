import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container section empty-state not-found">
      <p className="empty-emoji">🧶</p>
      <h1>404</h1>
      <h3>This page got lost in the craft box</h3>
      <p>The page you are looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
