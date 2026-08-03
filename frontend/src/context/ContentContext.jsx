import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { contentService } from "../services";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return contentService
      .bootstrap()
      .then(({ data }) => {
        setContent(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const settings = content?.settings || null;
  const homepage = content?.homepage || null;
  const footer = content?.footer || null;
  const social = content?.social || null;
  const contact = content?.contact || null;
  const about = content?.about || null;
  const announcements = content?.announcements || [];
  const reels = content?.reels || [];
  const gallery = content?.gallery || [];
  const featuredReviews = content?.featuredReviews || [];
  const latestReviews = content?.latestReviews || [];
  const faqs = content?.faqs || [];
  const activeCampaigns = content?.activeCampaigns || [];
  const activePopups = content?.activePopups || [];
  const featuredTestimonials = content?.featuredTestimonials || [];

  return (
    <ContentContext.Provider
      value={{
        content,
        settings,
        homepage,
        footer,
        social,
        contact,
        about,
        announcements,
        reels,
        gallery,
        featuredReviews,
        latestReviews,
        faqs,
        activeCampaigns,
        activePopups,
        featuredTestimonials,
        loading,
        refresh,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
