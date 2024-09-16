import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Profile from "./components/Profile"; // Example component for a profile page
import Login from "./components/Login"; // Example component for a login page
import Stories from "./components/Stories"; // Stories component
import SingleStory from "./components/SingleStory"; // SingleStory component
import "./app.css";
import { AuthProvider } from "./Context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Stories />} />
        <Route path="/stories/:id" element={<SingleStory />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
