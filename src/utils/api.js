// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // ✅ use env variable
  withCredentials: false, // set true if using cookies
});

// Attach token if stored
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
