import { useEffect, useState } from "react";
import { fetchAllUsers, deleteUsers } from "../API";
import { Link } from "react-router-dom";

export default function AdminUsersFeed() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (err) {
        setError("Failed to fetch users.");
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user's account, along with all their stories and comments? This action cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      await deleteUsers(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userId)
      );
    } catch (error) {
      console.error("Failed to delete the user:", error);
      setError("Failed to delete the user.");
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerCaseTerm = term.toLowerCase();
      const filtered = users.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(lowerCaseTerm)) ||
          (user.email && user.email.toLowerCase().includes(lowerCaseTerm))
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-surface dark:bg-surface-dark min-h-screen min-w-full">
      <h2 className="text-primary dark:text-accent-dark text-2xl font-semibold mb-4">
        All Users
      </h2>
      {error && (
        <p className="text-red-500 dark:text-red-300 text-center mb-4">{error}</p>
      )}

      <input
        type="text"
        placeholder="Search by username or email"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-2 mb-4 bg-input text-input-text dark:bg-input-dark dark:text-input-text-dark rounded-lg border border-border dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-button-dark dark:focus:ring-button-hover-dark"
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            if (
              pageNumber === currentPage ||
              (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNumber
                      ? "bg-button text-white dark:bg-button-dark dark:text-white"
                      : "bg-layer dark:bg-layer-dark text-primary dark:text-primary-dark"
                  } hover:bg-button-hover dark:hover:bg-button-hover-dark`}
                >
                  {pageNumber}
                </button>
              );
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-button text-white rounded-lg hover:bg-button-hover dark:bg-button-dark dark:hover:bg-button-hover-dark disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ul className="space-y-4">
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <li key={user.id} className="p-4 bg-layer dark:bg-layer-dark rounded-lg shadow-sm flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <span className="block text-primary dark:text-accent-dark font-semibold">
                    <Link to={`/users/${user.id}`}>{user.username || "Unknown User"}</Link>
                  </span>
                  <span className="block text-secondary dark:text-secondary-dark">
                    {user.email || "No email available"}
                  </span>
                  <span className="block text-sm text-primary dark:text-primary-dark">
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-center text-primary dark:text-primary-dark">No users available.</p>
        )}
      </ul>
    </div>
  );
}
