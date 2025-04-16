import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dark from "./images/dark-mode.png";
import Light from "./images/light-mode.png";
import Yarnia from "./images/yarniaLogo.png";

const NavBar = ({ user, setUser, darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleDarkModeToggle = () => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <nav
      className={`relative transition-colors duration-300 px-6 py-4 shadow-md border-b 
        ${darkMode ? "bg-nav-dark text-primary-dark border-border-dark" : "bg-nav text-primary border-border"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDarkModeToggle}
            className="w-8 h-8 hover:scale-105 transition-transform"
            aria-label="Toggle dark mode"
          >
            <img
              src={darkMode ? Light : Dark}
              alt="Mode icon"
              className="w-full h-full"
            />
          </button>
          <Link to="/" className="text-lg font-semibold hover:text-accent">Home</Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/">
            <img
              src={Yarnia}
              alt="Yarnia Logo"
              className="w-36 h-auto object-contain"
            />
          </Link>
        </div>

        {/* Right Section - Hamburger & Links */}
        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="text-xl"
          >
            ☰
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-sm">
          {user ? (
            <>
              <Link to="/profile" className="hover:text-accent">Profile</Link>
              {user.isAdmin && (
                <>
                  <Link to="/comments" className="hover:text-accent">All Comments</Link>
                  <Link to="/users" className="hover:text-accent">All Users</Link>
                </>
              )}
              <Link
                to="/logout"
                onClick={handleLogout}
                className="hover:underline text-badge dark:text-badge-dark"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-accent">Login</Link>
              <Link to="/register" className="hover:text-accent">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
  <div className="absolute top-14 right-6 bg-input dark:bg-input-dark p-4 shadow-lg rounded-lg z-50 w-48 space-y-2 text-sm sm:hidden">
    {user ? (
      <>
        <Link to="/profile" className="block hover:text-accent" onClick={() => setMenuOpen(false)}>Profile</Link>
        {user.isAdmin && (
          <>
            <Link to="/comments" className="block hover:text-accent" onClick={() => setMenuOpen(false)}>All Comments</Link>
            <Link to="/users" className="block hover:text-accent" onClick={() => setMenuOpen(false)}>All Users</Link>
          </>
        )}
        <button
          onClick={(e) => {
            handleLogout(e);
            setMenuOpen(false);
          }}
          className="block w-full text-left hover:underline text-badge dark:text-badge-dark"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className="block hover:text-accent" onClick={() => setMenuOpen(false)}>Login</Link>
        <Link to="/register" className="block hover:text-accent" onClick={() => setMenuOpen(false)}>Register</Link>
      </>
    )}
  </div>
)}
    </nav>
  );
};

export default NavBar;
