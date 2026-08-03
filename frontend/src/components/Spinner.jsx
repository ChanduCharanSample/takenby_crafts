import React from "react";

const Spinner = ({ text = "Loading..." }) => {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
