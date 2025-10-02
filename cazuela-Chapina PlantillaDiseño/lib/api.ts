import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:44343", //import.meta.env.VITE_API_URL ||
  headers: { "Content-Type": "application/json" },
});
