import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const storage = {
  setSession: (key, val) => sessionStorage.setItem(key, val),
  getSession: (key) => sessionStorage.getItem(key),
  setLocal: (key, val) => localStorage.setItem(key, val),
  getLocal: (key) => localStorage.getItem(key),
};

const shouldShow = (popup) => {
  const key = `craftora_popup_${popup._id}`;
  if (popup.display === "once-session") {
    return !storage.getSession(key);
  }
  if (popup.display === "daily") {
    const today = new Date().toISOString().slice(0, 10);
    return storage.getLocal(key) !== today;
  }
  return true;
};

const markShown = (popup) => {
  const key = `craftora_popup_${popup._id}`;
  if (popup.display === "once-session") {
    storage.setSession(key, "1");
  } else if (popup.display === "daily") {
    storage.setLocal(key, new Date().toISOString().slice(0, 10));
  }
};

const PopupModal = () => {
  const { activePopups } = useContent();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!activePopups.length) {
      setCurrent(null);
      return;
    }
    const first = activePopups.find((p) => p.display !== "disabled" && shouldShow(p));
    setCurrent(first || null);
  }, [activePopups]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!current) return null;

  const close = () => {
    if (current) markShown(current);
    setCurrent(null);
  };

  const handleButton = () => {
    const url = current.buttonUrl;
    markShown(current);
    setCurrent(null);
    if (url) navigate(url);
  };

  return (
    <div className="popup-overlay" onClick={close}>
      <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={close} aria-label="Close popup">
          <FaTimes />
        </button>
        {current.image && (
          <div className="popup-image-wrap">
            <img src={getImageUrl(current.image)} alt={current.title || "Offer"} className="popup-image" />
          </div>
        )}
        <div className="popup-body">
          {current.title && <h3 className="popup-title">{current.title}</h3>}
          {current.description && <p className="popup-desc">{current.description}</p>}
          {(current.buttonText || current.buttonUrl) && (
            <button className="btn btn-primary btn-block" onClick={handleButton}>
              {current.buttonText || "Learn More"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
