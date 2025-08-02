// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Helper to set auth headers
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch current user from token
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const res = await axios.get("/api/auth/user", {
        headers: getAuthHeader(),
        withCredentials: true,
      });
      setCurrentUser(res.data); // Should return { email, name } or similar
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("token");
      setCurrentUser(null);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("Login failed:", err.response?.data?.error || err.message);
      throw err;
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
    } catch (err) {
      console.error("Register failed:", err.response?.data?.error || err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
