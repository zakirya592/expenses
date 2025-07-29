import axios from "axios";
import { baseUrl } from "./config.jsx";

const userRequest = axios.create({
  baseURL: baseUrl,
  //   withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
// Add a request interceptor to include the token in the headers
userRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userRequest;
