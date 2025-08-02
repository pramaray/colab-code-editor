// // src/pages/RoomDashboard.jsx
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
//  // should give access to user.username

// import axios from "axios";

// const RoomDashboard = () => {
//   const [rooms, setRooms] = useState([]);
//   const [newRoomId, setNewRoomId] = useState("");
//   const { user } = useAuth(); 
//   //const [user,setUser]=useState("");
//   const [joinRoomId, setJoinRoomId] = useState("");
//   const navigate = useNavigate();



//   useEffect(() => {
//     console.log("Logged in as:", user?.username);

//     axios.get("http://localhost:4000/api/rooms/my", { withCredentials: true })
//       .then((res) => setRooms(res.data))
//       .catch((err) => console.error("Error fetching rooms:", err));
//      axios.get("http://localhost:4000/api/user", { withCredentials: true })
//         .then((res) => setUser(res.data))
//         .catch((err) => console.error("Error fetching user:", err));  
//   }, []);

//   const createRoom = () => {
//     if (!newRoomId) return alert("Enter Room ID");
//     axios.post("http://localhost:4000/api/rooms/create", { roomId: newRoomId }, { withCredentials: true })
//       .then((res) => {
//         setRooms((prev) => [...prev, res.data]);   
//         setNewRoomId("");
//       })
//       .catch((err) => alert(err.response?.data?.error || "Room creation failed"));
//      axios.get("http://localhost:4000/api/user", { withCredentials: true })
//     .then((res) => setUser(res.data))
//     .catch((err) => console.error("Error fetching user:", err));  
//   };

//   const joinRoom = () => {
//     if (!joinRoomId) return alert("Enter Room ID");
//     axios.post("http://localhost:4000/api/rooms/join", { roomId: joinRoomId }, { withCredentials: true })
//       .then((res) => {
//         if (!rooms.find(r => r.roomId === res.data.roomId)) {
//           setRooms((prev) => [...prev, res.data]);
//         }
//         setJoinRoomId("");
//       })
//       .catch((err) => alert(err.response?.data?.error || "Join failed"));
//        axios.get("http://localhost:4000/api/user", { withCredentials: true })
//     .then((res) => setUser(res.data))
//     .catch((err) => console.error("Error fetching user:", err));
//   };

//   const goToRoom = (roomId) => {
//     navigate(`/editor/${roomId}`, {
//   state: { roomId: roomId, username: user?.username || user?.name ||"Anonymous"},
// });
//   };

//   return (
//     <div className="min-h-screen bg-gray-950 text-white p-8">
//       <h1 className="text-3xl font-bold mb-6">Room Dashboard</h1>

//       {/* Create Room */}
//       <div className="mb-4">
//         <h2 className="text-xl font-semibold mb-2">Create a New Room</h2>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={newRoomId}
//             onChange={(e) => setNewRoomId(e.target.value)}
//             className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
//           />
//           <button onClick={createRoom} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
//             Create
//           </button>
//         </div>
//       </div>

//       {/* Join Room */}
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold mb-2">Join an Existing Room</h2>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={joinRoomId}
//             onChange={(e) => setJoinRoomId(e.target.value)}
//             className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
//           />
//           <button onClick={joinRoom} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
//             Join
//           </button>
//         </div>
//       </div>

//       {/* Room List */}
//       <div>
//         <h2 className="text-xl font-semibold mb-2">Your Rooms</h2>
//             {Array.isArray(rooms) && rooms.length > 0 ? (
//             <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                 {rooms.map((room) => (
//                 <li
//                     key={room._id}
//                     className="p-4 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition"
//                     onClick={() => goToRoom(room.roomId)}
//                 >
//                     <h3 className="text-lg font-bold">Room: {room.roomId}</h3>
//                     <p className="text-sm text-gray-400">Room ID: {room._id}</p>
//                 </li>
//                 ))}
//             </ul>
//             ) : (
//             <p className="text-gray-400">No rooms yet.</p>
//             )}
        
//       </div>
//     </div>
//   );
// };

// export default RoomDashboard;

// src/pages/RoomDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const RoomDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomId, setNewRoomId] = useState("");
  const { currentUser, loading } = useAuth(); // Use currentUser and loading from AuthContext
  const [joinRoomId, setJoinRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== AUTH STATE ===");
    console.log("Loading:", loading);
    console.log("Current user:", currentUser);
    console.log("User keys:", currentUser ? Object.keys(currentUser) : "no user");

    // Only fetch rooms if we have a user and not loading
    if (!loading && currentUser) {
      // Fetch user's rooms
      axios.get("http://localhost:4000/api/rooms/my", { withCredentials: true })
        .then((res) => {
          console.log("Rooms fetched:", res.data);
          setRooms(res.data);
        })
        .catch((err) => {
          console.error("Error fetching rooms:", err);
          if (err.response?.status === 401) {
            // User might not be properly authenticated
            console.log("Authentication error - redirecting to login");
            navigate("/login");
          }
        });
    }
  }, [currentUser, loading, navigate]);

  const createRoom = () => {
    if (!newRoomId) return alert("Enter Room ID");
    
    axios.post("http://localhost:4000/api/rooms/create", { roomId: newRoomId }, { withCredentials: true })
      .then((res) => {
        setRooms((prev) => [...prev, res.data]);   
        setNewRoomId("");
      })
      .catch((err) => alert(err.response?.data?.error || "Room creation failed"));
  };

  const joinRoom = () => {
    if (!joinRoomId) return alert("Enter Room ID");
    
    axios.post("http://localhost:4000/api/rooms/join", { roomId: joinRoomId }, { withCredentials: true })
      .then((res) => {
        if (!rooms.find(r => r.roomId === res.data.roomId)) {
          setRooms((prev) => [...prev, res.data]);
        }
        setJoinRoomId("");
      })
      .catch((err) => alert(err.response?.data?.error || "Join failed"));
  };

  const goToRoom = (roomId) => {
    // Get username from currentUser - try multiple possible fields
    const username = currentUser?.username || currentUser?.name || currentUser?.email?.split('@')[0];
    
    console.log("=== NAVIGATION DEBUG ===");
    console.log("Current user:", currentUser);
    console.log("Extracted username:", username);
    
    if (!username) {
      alert("User data not available. Please refresh and try again.");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { 
        roomId: roomId, 
        username: username
      },
    });
  };

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading...</div>
          <div className="text-sm text-gray-400">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if no user after loading
  if (!loading && !currentUser) {
    navigate("/login");
    return null;
  }

  // Get display name
  const displayName = currentUser?.username || currentUser?.name || currentUser?.email || "Unknown User";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      

      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Room Dashboard</h1>
        <p className="text-gray-400">Welcome, {displayName}!</p>
      </div>

      {/* Create Room */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create a New Room</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
          />
          <button onClick={createRoom} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Create
          </button>
        </div>
      </div>

      {/* Join Room */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Join an Existing Room</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 border border-gray-700"
          />
          <button onClick={joinRoom} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Join
          </button>
        </div>
      </div>

      {/* Room List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Rooms</h2>
        {Array.isArray(rooms) && rooms.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <li
                key={room._id}
                className="p-4 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition"
                onClick={() => goToRoom(room.roomId)}
              >
                <h3 className="text-lg font-bold">Room: {room.roomId}</h3>
                <p className="text-sm text-gray-400">Room ID: {room._id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No rooms yet.</p>
        )}
      </div>
    </div>
  );
};

export default RoomDashboard;