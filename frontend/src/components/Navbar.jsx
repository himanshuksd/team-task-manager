import { useNavigate } from "react-router-dom"

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  function handleLogout() {
    onLogout()
    navigate("/login")
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
      <span
        className="font-bold text-lg cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Task Manager
      </span>
      <div className="flex items-center gap-4">
        <span className="text-sm">Hello, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 text-sm px-3 py-1 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
