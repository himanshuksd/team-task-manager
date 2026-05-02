import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"


const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function Dashboard({ token, user, onLogout }) {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [creating, setCreating] = useState(false)

  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    fetch(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || [])
        setProjects(data.projects || [])
        setOverdueCount(data.overdueCount || 0)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }, [token])

  async function createProject(e) {
    e.preventDefault()
    if (!projectName.trim()) return
    setCreating(true)

    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: projectName, description: projectDesc }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        setCreating(false)
        return
      }

      navigate(`/projects/${data.id}`)
    } catch (err) {
      console.log(err)
      alert("something went wrong")
      setCreating(false)
    }
  }

  async function changeStatus(taskId, newStatus) {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (err) {
      console.log(err)
    }
  }

  const filteredTasks =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter)

  function isOverdue(task) {
    return (
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "DONE"
    )
  }

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={onLogout} />
        <p className="text-center mt-20 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
            <p className="text-sm text-gray-500 mt-1">Tasks Assigned</p>
          </div>
          <div className={`bg-white rounded shadow p-4 text-center ${overdueCount > 0 ? "border-l-4 border-red-500" : ""}`}>
            <p className={`text-3xl font-bold ${overdueCount > 0 ? "text-red-500" : "text-gray-700"}`}>
              {overdueCount}
            </p>
            <p className="text-sm text-gray-500 mt-1">Overdue</p>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{projects.length}</p>
            <p className="text-sm text-gray-500 mt-1">Projects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">My Tasks</h2>
              <div className="flex gap-1 text-sm">
                {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-2 py-1 rounded ${
                      filter === s
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {s === "IN_PROGRESS" ? "In Progress" : s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded shadow p-6 text-center text-gray-400">
                no tasks found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white rounded shadow p-4 ${isOverdue(task) ? "border-l-4 border-red-400" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Project:{" "}
                          <span
                            className="text-blue-500 cursor-pointer hover:underline"
                            onClick={() => navigate(`/projects/${task.project.id}`)}
                          >
                            {task.project.name}
                          </span>
                        </p>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => changeStatus(task.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 ml-2"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>

                    {task.dueDate && (
                      <p className={`text-xs mt-2 ${isOverdue(task) ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task) && " — OVERDUE"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-700">My Projects</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-sm text-blue-600 hover:underline"
              >
                + New
              </button>
            </div>

            {showForm && (
              <form onSubmit={createProject} className="bg-white rounded shadow p-4 mb-3">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="project name"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-500"
                  required
                  autoFocus
                />
                <input
                  type="text"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="description (optional)"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm py-1.5 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white rounded shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-gray-800">{project.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{project._count.tasks} tasks</p>
                </div>
              ))}

              {projects.length === 0 && !showForm && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No projects yet. Create one!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard