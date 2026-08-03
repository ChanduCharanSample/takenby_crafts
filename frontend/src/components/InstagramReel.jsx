import React, { useEffect, useRef, useState } from "react";
import { FaInstagram, FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { contentService } from "../services";

const extractCode = (url) => {
  if (!url) return "";
  const m = url.match(/reel[s]?\/([A-Za-z0-9_-]+)/) || url.match(/p\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : "";
};

const InstagramReel = ({ url, title }) => {
  const code = extractCode(url);
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | playing | failed
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setVideoUrl("");
    setStatus("loading");
    setProgress(0);
    setDuration(0);
    if (!url || !code) {
      setStatus("failed");
      return;
    }
    contentService
      .reelVideo(url)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.success && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setStatus("ready");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [url, code]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setStatus("playing");
    } else {
      v.pause();
      setStatus("ready");
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) {
      setDuration(v.duration);
      v.muted = true;
    }
  };

  if (!url || !code || status === "failed") {
    return (
      <div className="reel-card">
        <div className="reel-fallback">
          <div className="reel-fallback-icon">
            <FaInstagram size={38} />
          </div>
          <p>{title || "Watch this reel"}</p>
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
              Open on Instagram
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`reel-card ${status === "playing" ? "is-playing" : ""}`} onClick={togglePlay}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="reel-video"
          loop
          playsInline
          muted={muted}
          preload="metadata"
          poster=""
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={() => setStatus("playing")}
          onPause={() => setStatus("ready")}
          onEnded={() => setStatus("ready")}
        />
      ) : (
        <div className="reel-loading">
          <FaInstagram size={38} />
          <p>Loading reel…</p>
        </div>
      )}

      {status !== "playing" && videoUrl && (
        <div className="reel-overlay">
          <div className="reel-fallback-icon">
            <FaInstagram size={34} />
            <span className="reel-play"><FaPlay /></span>
          </div>
          <p>{title || "Play this reel"}</p>
          <span className="reel-duration">{formatTime(duration)}</span>
        </div>
      )}

      {videoUrl && (
        <button className="reel-mute" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      )}

      {videoUrl && (
        <div className="reel-progress">
          <div className="reel-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

const formatTime = (s) => {
  if (!s || !isFinite(s)) return "";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default InstagramReel;
