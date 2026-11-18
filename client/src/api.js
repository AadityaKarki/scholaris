import axios from "axios";
import { getAuth } from "firebase/auth";
import app from "./firebase";

// One place for the API's address. Set VITE_API_URL in client/.env to change it.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// Send the signed-in user's Firebase ID token with every request; the server
// checks it and uses it to know who is asking.
api.interceptors.request.use(async (request) => {
  const user = getAuth(app).currentUser;
  if (user) {
    request.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return request;
});

export default api;
