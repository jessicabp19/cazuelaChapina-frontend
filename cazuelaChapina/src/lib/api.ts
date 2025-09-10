import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:44343",
  headers: { "Content-Type": "application/json" },
});
