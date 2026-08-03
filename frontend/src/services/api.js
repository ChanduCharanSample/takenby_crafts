import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("craftora_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const current = localStorage.getItem("craftora_token");
      if (current) {
        localStorage.removeItem("craftora_token");
        localStorage.removeItem("craftora_user");
      }
    }
    return Promise.reject(error);
  }
);

const getMessage = (error, fallback = "Something went wrong") => {
  return error?.response?.data?.message || error?.message || fallback;
};

export { getMessage };
export default api;
