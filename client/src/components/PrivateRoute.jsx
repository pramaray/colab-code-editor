// client/src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Wait for fetchUser to complete

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;


