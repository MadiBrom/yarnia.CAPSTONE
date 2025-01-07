import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Stories from "./components/Stories";
import Bookmarks from "./components/Bookmarks";
import NavBar from "./components/Navbar";
import Register from "./components/Register";
import SingleStory from "./components/SingleStory";
import Logout from "./components/Logout";
import AddStory from "./components/addStory";
import AdminCommentsFeed from "./components/AdminCommentsFeed";
import StoryDetails from "./components/StoryDetails";
import UserProfile from "./components/UserProfile";
import AdminUsers from "./components/AdminUsers";
import FollowersSection from "./components/FollowersSection";
import StoryComments from "./components/StoryComments"; // Importing the new StoryComments component
import "react-quill/dist/quill.snow.css";
import "./App.css";
// import "./NEWapp.css";
import jwt_decode from "jwt-decode";
import FollowingSection from "./components/FollowingSection";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedUser = jwt_decode(token);

        if (decodedUser.exp * 1000 < Date.now()) {
          console.log("Token expired");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          return;
        }

        const userInfo = JSON.parse(localStorage.getItem("user"));
        setUser(userInfo);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div>
      <NavBar user={user} setUser={setUser} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Stories />} />
        <Route path="/bookmarks" element={<Bookmarks user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route
          path="/profile"
          element={<Profile user={user} setUser={setUser} />}
        />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/stories/:storyId" element={<SingleStory user={user} />} />
        <Route path="/stories/:storyId/comments" element={<StoryComments />} />
        <Route path="/logout" element={<Logout setUser={setUser} />} />
        <Route path="/add-story" element={<AddStory />} />
        <Route path="/stories" element={<StoryDetails />} />
        <Route path="/comments" element={<AdminCommentsFeed />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/users/:authorId" element={<UserProfile />} />
        <Route path="/followers" element={<FollowersSection />} />
        <Route path="/following" element={<FollowingSection/>} />
      </Routes>
    </div>
  );
}

export default App;
