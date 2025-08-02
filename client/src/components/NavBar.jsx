import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-semibold text-black">CodeCollab</Link>

      {currentUser ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {currentUser.username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 text-sm"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
        </div>
      )}
    </div>
  );
}
