// // client/src/context/AuthContext.jsx
// import { createContext, useState, useEffect, useContext } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);

//   // Helper to set auth headers
//   const getAuthHeader = () => {
//     const token = localStorage.getItem("token");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   // Fetch current user from token
//   const fetchUser = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setCurrentUser(null);
//       return;
//     }

//     try {
//       const res = await axios.get("/api/auth/user", {
//         headers: getAuthHeader(),
//         withCredentials: true,
//       });
//       setCurrentUser(res.data); // Should return { email, name } or similar
//     } catch (err) {
//       console.error("Error fetching user:", err);
//       localStorage.removeItem("token");
//       setCurrentUser(null);
//     }
//   };

//   // Login
//   const login = async (email, password) => {
//     try {
//       const res = await axios.post("/api/auth/login", { email, password });
//       localStorage.setItem("token", res.data.token);
//       setCurrentUser(res.data.user);
//     } catch (err) {
//       console.error("Login failed:", err.response?.data?.error || err.message);
//       throw err;
//     }
//   };

//   // Register
//   const register = async (name, email, password) => {
//     try {
//       const res = await axios.post("/api/auth/register", { name, email, password });
//       localStorage.setItem("token", res.data.token);
//       setCurrentUser(res.data.user);
//     } catch (err) {
//       console.error("Register failed:", err.response?.data?.error || err.message);
//       throw err;
//     }
//   };

//   // Logout
//   const logout = () => {
//     localStorage.removeItem("token");
//     setCurrentUser(null);
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ currentUser, login, register, logout, fetchUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// client/src/context/AuthContext.jsx
// client/src/context/AuthContext.jsx
// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

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
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching user with token...");
      
      // Try the auth route first
      let res;
      try {
        res = await axios.get("http://localhost:4000/api/auth/user", {
          headers: getAuthHeader(),
          withCredentials: true,
        });
      } catch (authErr) {
        console.log("Auth route failed, trying /api/user...");
        // Fallback to the other endpoint
        res = await axios.get("http://localhost:4000/api/user", {
          headers: getAuthHeader(),
          withCredentials: true,
        });
      }
      
      console.log("API response:", res.data);
      
      // Check if we got token payload instead of user data
      if (res.data.userId && !res.data.username && !res.data.name && !res.data.email) {
        console.log("Got token payload, creating display user...");
        
        // Create a user object with a readable display name
        const displayUser = {
          userId: res.data.userId,
          username: `User_${res.data.userId.slice(-8)}`, // Last 8 chars of userId
          name: `User ${res.data.userId.slice(-8)}`,
          displayName: `User ${res.data.userId.slice(-8)}`
        };
        
        console.log("Created display user:", displayUser);
        setCurrentUser(displayUser);
      } else {
        // We got proper user data
        console.log("User data fetched successfully:", res.data);
        setCurrentUser(res.data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      console.log("Error response:", err.response?.data);
      localStorage.removeItem("token");
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
      console.log("Login successful:", res.data.user);
    } catch (err) {
      console.error("Login failed:", err.response?.data?.error || err.message);
      throw err;
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      setCurrentUser(res.data.user);
      console.log("Registration successful:", res.data.user);
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
    <AuthContext.Provider value={{ 
      currentUser, 
      user: currentUser, // Also provide as 'user' for backward compatibility
      loading,
      login, 
      register, 
      logout, 
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);