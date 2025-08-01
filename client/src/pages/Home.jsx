// src/pages/Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!roomId || !username) {
      alert("Please enter both Room ID and Username.");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold">Join a Room</h1>
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
      />
      <input
        type="text"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
      />
      <button
        onClick={handleJoin}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Join Room
      </button>
    </div>
  );
};

export default Home;

