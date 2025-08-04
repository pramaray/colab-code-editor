
// import { useEffect, useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
// import { io } from "socket.io-client";
// import { useParams, useLocation } from "react-router-dom";
// import axios from "axios";

// const EditorPage = () => {
//   //const { roomId} = useParams();
//   //const { state } = useLocation();
//   //const username = state?.username || "Anonymous";
//   const location = useLocation();
//   const { roomId, username } = location.state || {};
//   console.log(username);
//   const [users, setUsers] = useState([]);
//   const [language, setLanguage] = useState("javascript");
//   const [code, setCode] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [typingUsers, setTypingUsers] = useState({});

//   const socketRef = useRef(null);
//   const codeRef = useRef("");
//   const editorRef = useRef(null);
//   const typingTimeouts = useRef({});

//   // Fetch existing messages from MongoDB


//   useEffect(() => {
//     axios.get(`http://localhost:4000/api/messages/${roomId}`).then((res) => {
//       setMessages(res.data || []);
//     });
//   }, [roomId]);

//   useEffect(() => {
    
//     socketRef.current = io("http://localhost:4000");

//     socketRef.current.emit("join-room", { roomId, username });
//     socketRef.current.emit("join", { roomId, username });

//     socketRef.current.on("room-users", setUsers);

//     socketRef.current.on("code-change", (newCode) => {
//       if (newCode !== codeRef.current) {
//         codeRef.current = newCode;
//         setCode(newCode);
//       }
//     });

//     socketRef.current.on("receive-message", (data) => {
//       setMessages((prev) => [...prev, data]);
//     });

//     socketRef.current.on("user-typing", ({ username }) => {
//       setTypingUsers((prev) => ({ ...prev, [username]: true }));
//       clearTimeout(typingTimeouts.current[username]);
//       typingTimeouts.current[username] = setTimeout(() => {
//         setTypingUsers((prev) => {
//           const newTyping = { ...prev };
//           delete newTyping[username];
//           return newTyping;
//         });
//       }, 2000);
//     });

//     socketRef.current.on("user-joined", (user) => {
//       setMessages((prev) => [...prev, { system: true, text: `${user} joined` }]);
//     });

//     socketRef.current.on("user-left", (user) => {
//       setMessages((prev) => [...prev, { system: true, text: `${user} left` }]);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [roomId, username]);

//   const handleChange = (value) => {
//     codeRef.current = value;
//     setCode(value);
//     socketRef.current.emit("code-change", { roomId, code: value });
//   };

//   const sendMessage = () => {
//     if (messageInput.trim() === "") return;
//     const msgData = { username, roomId, text: messageInput };
//     socketRef.current.emit("send-message", msgData);
//     setMessages((prev) => [...prev, msgData]);
//     setMessageInput("");
//   };

//   const handleTyping = () => {
//     socketRef.current.emit("user-typing", { roomId, username });
//   };

//   return (
//     <div className="flex h-screen w-screen overflow-hidden">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-900 text-white p-4 flex-shrink-0">
//         <h2 className="text-lg font-bold mb-2">👥 Users</h2>
//         <ul className="space-y-1 text-sm">
//           {users.map((u) => (
//             <li key={u.socketId}>
//               {u.username}
//               {typingUsers[u.username] && <span className="text-green-400 ml-1">typing...</span>}
//             </li>
//           ))}
//         </ul>

//         <div className="mt-6">
//           <label className="block text-sm font-semibold mb-1">Language:</label>
//           <select
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//             className="bg-gray-800 text-white border border-gray-700 px-2 py-1 rounded w-full"
//           >
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//             <option value="cpp">C++</option>
//             <option value="java">Java</option>
//             <option value="html">HTML</option>
//           </select>
//         </div>
//       </div>

//       {/* Code + Chat */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Editor Container with fixed height calculation */}
//         <div className="flex-1 relative" style={{ minHeight: 0 }}>
//           <Editor
//             height="calc(100vh - 14rem)"
//             width="100%"
//             language={language}
//             value={code}
//             onChange={handleChange}
//             theme="vs-dark"
//             onMount={(editor) => {
//               editorRef.current = editor;
//               // Force layout after mount
//               setTimeout(() => {
//                 editor.layout();
//               }, 100);
//             }}
//             options={{
//               automaticLayout: true,
//               minimap: { enabled: true },
//               fontSize: 14,
//               wordWrap: "on",
//               scrollBeyondLastLine: false,
//             }}
//           />
//         </div>

//         {/* Chat Panel */}
//         <div className="h-56 border-t border-gray-700 bg-gray-800 text-white p-4 flex flex-col flex-shrink-0">
//           <div className="flex-1 overflow-y-auto text-sm mb-2 space-y-1 pr-1">
//             {messages.map((msg, idx) => (
//               <div key={idx}>
//                 {msg.system ? (
//                   <div className="text-gray-400 italic text-xs">{msg.text}</div>
//                 ) : (
//                   <div>
//                     <span className="font-bold text-blue-400">{msg.username}:</span>{" "}
//                     <span>{msg.text}</span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex mt-1">
//             <input
//               className="flex-1 px-3 py-1 rounded bg-gray-700 text-white focus:outline-none"
//               type="text"
//               placeholder="Type a message..."
//               value={messageInput}
//               onChange={(e) => setMessageInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") sendMessage();
//                 else handleTyping();
//               }}
//             />
//             <button
//               onClick={sendMessage}
//               className="ml-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-500"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditorPage;

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  
  // Get data from navigation state, fallback to URL params
  const { roomId, username } = location.state || {};
  //console.log(name);
  const finalRoomId = roomId || paramRoomId;
  const [roomName, setRoomName] = useState(""); // fallback to passed name if available
  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUsers, setTypingUsers] = useState({});

  const socketRef = useRef(null);
  const codeRef = useRef("");
  const editorRef = useRef(null);
  const typingTimeouts = useRef({});

  // Redirect if no proper room data
  useEffect(() => {
    if (!finalRoomId || !username) {
      console.error("Missing room data:", { finalRoomId, username });
      alert("Invalid room access. Redirecting to dashboard.");
      navigate("/Home");
      return;
    }
    
    //console.log("Joined editor as:", username, "in room:", finalRoomId);
  }, [finalRoomId, username, navigate]);
  useEffect(() => {
  if (!roomName && finalRoomId) {
    axios
      .get(`http://localhost:4000/api/rooms/info/${finalRoomId}`)
      .then((res) => {
        setRoomName(res.data.name || "Unnamed Room");
      })
      .catch((err) => {
        console.error("Failed to fetch room name:", err);
        setRoomName("Unknown Room");
      });
  }
}, [finalRoomId, roomName]);

  // Fetch existing messages from MongoDB
  useEffect(() => {
    if (!finalRoomId) return;
    
    axios.get(`http://localhost:4000/api/messages/${finalRoomId}`)
      .then((res) => {
        setMessages(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
      });
  }, [finalRoomId]);

  useEffect(() => {
    if (!finalRoomId || !username) return;
    
    //console.log("Connecting to socket with:", { finalRoomId, username });
    
    socketRef.current = io("http://localhost:4000");

    // Join the room
    socketRef.current.emit("join-room", { roomId: finalRoomId, username });

    // Listen for room users
    socketRef.current.on("room-users", (userList) => {
      //console.log("Room users updated:", userList);
      setUsers(userList);
    });

    // Listen for code changes
    socketRef.current.on("code-change", (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        setCode(newCode);
      }
    });

    // Listen for messages
    socketRef.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing indicators
    socketRef.current.on("user-typing", ({ username: typingUsername }) => {
      if (typingUsername !== username) { // Don't show typing for current user
        setTypingUsers((prev) => ({ ...prev, [typingUsername]: true }));
        clearTimeout(typingTimeouts.current[typingUsername]);
        typingTimeouts.current[typingUsername] = setTimeout(() => {
          setTypingUsers((prev) => {
            const newTyping = { ...prev };
            delete newTyping[typingUsername];
            return newTyping;
          });
        }, 2000);
      }
    });

    // Listen for user join/leave
    socketRef.current.on("user-joined", (user) => {
      setMessages((prev) => [...prev, { system: true, text: `${user} joined`, timestamp: Date.now() }]);
    });

    socketRef.current.on("user-left", (user) => {
      setMessages((prev) => [...prev, { system: true, text: `${user} left`, timestamp: Date.now() }]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [finalRoomId, username]);

  const handleChange = (value) => {
    codeRef.current = value;
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit("code-change", { roomId: finalRoomId, code: value });
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() === "" || !socketRef.current) return;
    
    const msgData = { 
      username, 
      roomId: finalRoomId, 
      text: messageInput,
      timestamp: Date.now()
    };
    
    socketRef.current.emit("send-message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessageInput("");
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("user-typing", { roomId: finalRoomId, username });
    }
  };

  // Show loading state if room data is not available
  if (!finalRoomId || !username) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-xl">Loading room data...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex-shrink-0">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-1">👥 Users in Room</h2>
          <p className="text-xs text-gray-400">Room: {roomName}</p>
          <p className="text-xs text-gray-400">You: {username}</p>
        </div>
        
        <ul className="space-y-1 text-sm mb-6">
          {users.length > 0 ? (
            users.map((u) => (
              <li key={u.socketId} className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {u.username}
                {typingUsers[u.username] && (
                  <span className="text-green-400 ml-1 text-xs">typing...</span>
                )}
              </li>
            ))
          ) : (
            <li className="text-gray-400 text-xs">No other users</li>
          )}
        </ul>

        <div className="mt-6">
          <label className="block text-sm font-semibold mb-1">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 px-2 py-1 rounded w-full"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
          </select>
        </div>

        <button
          onClick={() => navigate("/Home")}
          className="mt-4 w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Code + Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Container */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          <Editor
            height="calc(100vh - 14rem)"
            width="100%"
            language={language}
            value={code}
            onChange={handleChange}
            theme="vs-dark"
            onMount={(editor) => {
              editorRef.current = editor;
              setTimeout(() => {
                editor.layout();
              }, 100);
            }}
            options={{
              automaticLayout: true,
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Chat Panel */}
        <div className="h-56 border-t border-gray-700 bg-gray-800 text-white p-4 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto text-sm mb-2 space-y-1 pr-1">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.system ? (
                  <div className="text-gray-400 italic text-xs">{msg.text}</div>
                ) : (
                  <div>
                    <span className={`font-bold ${msg.username === username ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {msg.username}:
                    </span>{" "}
                    <span>{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex mt-1">
            <input
              className="flex-1 px-3 py-1 rounded bg-gray-700 text-white focus:outline-none"
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
                else handleTyping();
              }}
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-1 rounded bg-blue-600 hover:bg-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;