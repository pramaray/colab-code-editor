// client/src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"], // force only websocket
});

export default socket;

