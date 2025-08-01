import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function ChatPanel({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef();

  // 🔁 Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Load old messages and listen for updates
  useEffect(() => {
    // Ask server for messages of this room
    socket.emit("get-messages", roomId);

    // Server sends all existing messages
    socket.on("load-messages", (msgs) => {
      setMessages(msgs);
    });

    // New message received from any user
    socket.on("receive-message", ({ username, text }) => {
      setMessages((prev) => [...prev, { username, text }]);
    });

    // Typing indicator
    socket.on("user-typing", ({ username }) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(null), 1500);
    });

    return () => {
      socket.off("load-messages");
      socket.off("receive-message");
      socket.off("user-typing");
    };
  }, [roomId]);

  // ✉️ Send message
  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    socket.emit("send-message", { roomId, username, text });
    setInput(""); // Clear input (✅ no optimistic update needed anymore)
  };

  // ⌨️ Typing indicator
  const handleTyping = () => {
    socket.emit("user-typing", { roomId, username });
  };

  return (
    <div className="w-80 h-full border-l border-gray-700 flex flex-col bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold text-green-400">{msg.username}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="px-4 py-1 text-xs text-gray-400 animate-pulse">
          {typingUser} is typing...
        </div>
      )}

      <div className="p-2 border-t border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message..."
          className="w-full p-2 bg-gray-800 rounded outline-none text-white"
        />
      </div>
    </div>
  );
}

export default ChatPanel;
