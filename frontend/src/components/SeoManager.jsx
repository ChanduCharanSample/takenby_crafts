import { useEffect } from "react";
import { useContent } from "../context/ContentContext";
import { getImageUrl } from "../utils/helpers";

const setMeta = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const SeoManager = () => {
  const { settings } = useContent();

  useEffect(() => {
    if (!settings) return;
    const title = settings.browserTitle || settings.metaTitle || settings.websiteName || "TakenBy_Crafts";
    document.title = title;
    setMeta("title", settings.metaTitle || title);
    setMeta("description", settings.metaDescription);
    setMeta("keywords", settings.metaKeywords);
    const favicon = settings.favicon || settings.logo;
    if (favicon) {
      const href = getImageUrl(favicon);
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((l) => (l.href = href));
      if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement("link");
        link.setAttribute("rel", "icon");
        link.setAttribute("href", href);
        document.head.appendChild(link);
      }
    }
  }, [settings]);

  return null;
};

export default SeoManager;
