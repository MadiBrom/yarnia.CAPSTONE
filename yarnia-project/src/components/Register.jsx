import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewUser } from "../API";

const Register = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await createNewUser(username, email, password);

      if (result && result.token) {
        const userData = { username, email };
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);

        navigate("/profile");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("User already exists with this email or username");
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen min-w-full">
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg dark:bg-card-dark">
      <h2 className="text-primary dark:text-accent-dark text-2xl font-semibold mb-4">Register New Account</h2>
      {error && (
        <p className="text-red-500 text-sm mb-4 dark:text-red-300">{error}</p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-primary dark:text-primary-dark mb-1">
            Username
          </label>
          <input
            id="username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark rounded-lg border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button-dark dark:focus:ring-button-hover-dark"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-primary dark:text-primary-dark mb-1">
            Email
          </label>
          <input
            id="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark rounded-lg border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button-dark dark:focus:ring-button-hover-dark"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-primary dark:text-primary-dark mb-1">
            Password
          </label>
          <input
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark rounded-lg border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button-dark dark:focus:ring-button-hover-dark"
          />
        </div>

        <button
          className="w-full py-2 mt-4 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
        </div>

  );
};

export default Register;
