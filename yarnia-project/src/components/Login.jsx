import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../API";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(email, password);
      if (response && response.token) {

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        setUser(response.user); 

        navigate("/profile"); 
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      console.error("Login failed: ", err);
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen min-w-full">
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg dark:bg-card-dark">
      <h2 className="text-primary dark:text-accent-dark text-2xl font-semibold mb-4">Login</h2>
      {error && (
        <p className="text-red-500 text-sm mb-4 dark:text-red-300">{error}</p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-primary dark:text-primary-dark mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
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
            type="password"
            placeholder="Password"
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

export default Login;
