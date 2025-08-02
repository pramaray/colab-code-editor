import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Login() {
  const { fetchUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/auth/login", formData, {
        withCredentials: true,
      });
      await fetchUser();
      navigate("/Home");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96 space-y-4">
        <h2 className="text-2xl font-semibold">Login</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
          Login
        </button>
        <div className="text-center text-sm text-gray-600">or</div>
        <div className="flex flex-col space-y-2">
          <a
            href="http://localhost:4000/api/auth/google"
            className="w-full bg-red-500 text-white py-2 rounded text-center hover:bg-red-600"
          >
            Login with Google
          </a>
          <a
            href="http://localhost:4000/api/auth/github"
            className="w-full bg-gray-800 text-white py-2 rounded text-center hover:bg-gray-900"
          >
            Login with GitHub
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Don't have an account? <a href="/register" className="underline">Register</a>
        </p>
      </form>
    </div>
  );
}