// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/LandingPage";
import RoomDashboard from "./pages/RoomDashboard";
import './index.css';  // or './App.css' if that's where you wrote it

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/H" element={
        <PrivateRoute> {<Home />}</PrivateRoute>}/>
        <Route path="/Home" element={
        <PrivateRoute> {<RoomDashboard />}</PrivateRoute>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/editor/:roomId"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

