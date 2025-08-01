

// import { useEffect, useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
// import { io } from "socket.io-client";
// import { useParams, useLocation } from "react-router-dom";
// import axios from "axios";

// const EditorPage = () => {
//   const { roomId } = useParams();
//   const { state } = useLocation();
//   const username = state?.username || "Anonymous";

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
//       <div className="flex-1 flex flex-col relative">
//         <div className="flex-1 min-h-0 relative">
//           <Editor
//             height="100%"
//             width="100%"
//             language={language}
//             value={code}
//             onChange={handleChange}
//             theme="vs-dark"
//             onMount={(editor) => {
//               editorRef.current = editor;
//             }}
//             options={{
//               automaticLayout: true,
//               minimap: { enabled: true },
//               fontSize: 14,
//               wordWrap: "on",
//             }}
//           />
//         </div>

//         {/* Chat Panel */}
//         <div className="h-56 border-t border-gray-700 bg-gray-800 text-white p-4 flex flex-col">
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
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

const EditorPage = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const username = state?.username || "Anonymous";

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

  // Fetch existing messages from MongoDB
  useEffect(() => {
    axios.get(`http://localhost:4000/api/messages/${roomId}`).then((res) => {
      setMessages(res.data || []);
    });
  }, [roomId]);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    socketRef.current.emit("join-room", { roomId, username });

    socketRef.current.on("room-users", setUsers);

    socketRef.current.on("code-change", (newCode) => {
      if (newCode !== codeRef.current) {
        codeRef.current = newCode;
        setCode(newCode);
      }
    });

    socketRef.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("user-typing", ({ username }) => {
      setTypingUsers((prev) => ({ ...prev, [username]: true }));
      clearTimeout(typingTimeouts.current[username]);
      typingTimeouts.current[username] = setTimeout(() => {
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          delete newTyping[username];
          return newTyping;
        });
      }, 2000);
    });

    socketRef.current.on("user-joined", (user) => {
      setMessages((prev) => [...prev, { system: true, text: `${user} joined` }]);
    });

    socketRef.current.on("user-left", (user) => {
      setMessages((prev) => [...prev, { system: true, text: `${user} left` }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, username]);

  const handleChange = (value) => {
    codeRef.current = value;
    setCode(value);
    socketRef.current.emit("code-change", { roomId, code: value });
  };

  const sendMessage = () => {
    if (messageInput.trim() === "") return;
    const msgData = { username, roomId, text: messageInput };
    socketRef.current.emit("send-message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessageInput("");
  };

  const handleTyping = () => {
    socketRef.current.emit("user-typing", { roomId, username });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex-shrink-0">
        <h2 className="text-lg font-bold mb-2">👥 Users</h2>
        <ul className="space-y-1 text-sm">
          {users.map((u) => (
            <li key={u.socketId}>
              {u.username}
              {typingUsers[u.username] && <span className="text-green-400 ml-1">typing...</span>}
            </li>
          ))}
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
      </div>

      {/* Code + Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Container with fixed height calculation */}
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
              // Force layout after mount
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
                    <span className="font-bold text-blue-400">{msg.username}:</span>{" "}
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