import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

// ✅ Fixed - using Vite env variable
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function ProjectPage({ token, user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [myRole, setMyRole] = useState("")

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskDue, setTaskDue] = useState("")
  const [addingTask, setAddingTask] = useState(false)

  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState("Member")
  const [addingMember, setAddingMember] = useState(false)

  const [activeTab, setActiveTab] = useState("TODO")

  function loadProject() {
    fetch(`${API}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("cannot access this project")
        return res.json()
      })
      .then((data) => {
        setProject(data)
        setMyRole(data.myRole)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadProject()
  }, [id])

  async function addTask(e) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    setAddingTask(true)

    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc || undefined,
          projectId: parseInt(id),
          assignedToId: taskAssignee ? parseInt(taskAssignee) : undefined,
          dueDate: taskDue || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        setAddingTask(false)
        return
      }

      setProject((prev) => ({ ...prev, tasks: [data, ...prev.tasks] }))
      setTaskTitle("")
      setTaskDesc("")
      setTaskAssignee("")
      setTaskDue("")
      setShowTaskForm(false)
    } catch (err) {
      console.log(err)
      alert("something went wrong")
    }

    setAddingTask(false)
  }

  async function updateStatus(taskId, newStatus) {
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
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }))
    } catch (err) {
      console.log(err)
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("delete this task?")) return

    try {
      const res = await fetch(`${API}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.message)
        return
      }

      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      }))
    } catch (err) {
      console.log(err)
    }
  }

  async function addMember(e) {
    e.preventDefault()
    setAddingMember(true)

    try {
      const res = await fetch(`${API}/projects/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: memberEmail, role: memberRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message)
        setAddingMember(false)
        return
      }

      setProject((prev) => ({ ...prev, members: [...prev.members, data] }))
      setMemberEmail("")
      setShowMemberForm(false)
    } catch (err) {
      console.log(err)
      alert("something went wrong")
    }

    setAddingMember(false)
  }

  function isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
  }

  const tasksByStatus = {
    TODO: project?.tasks.filter((t) => t.status === "TODO") || [],
    IN_PROGRESS: project?.tasks.filter((t) => t.status === "IN_PROGRESS") || [],
    DONE: project?.tasks.filter((t) => t.status === "DONE") || [],
  }

  const statusColors = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
  }

  if (loading) {
    return (
      <div>
        <Navbar user={user} onLogout={onLogout} />
        <p className="text-center mt-20 text-gray-500">Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar user={user} onLogout={onLogout} />
        <div className="text-center mt-20">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={() => navigate("/dashboard")} className="text-blue-600 hover:underline text-sm">
            back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p
              className="text-sm text-blue-600 hover:underline cursor-pointer mb-1"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </p>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Add Task
          </button>
        </div>

        {showTaskForm && (
          <div className="bg-white rounded shadow p-5 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">New Task</h3>
            <form onSubmit={addTask}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Title *</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="what needs to be done?"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Assign to</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="">unassigned</option>
                    {project.members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="optional"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={addingTask}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingTask ? "Adding..." : "Add Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="md:hidden flex gap-2 mb-4">
          {["TODO", "IN_PROGRESS", "DONE"].map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`flex-1 text-sm py-1.5 rounded ${
                activeTab === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
              }`}
            >
              {s === "IN_PROGRESS" ? "In Progress" : s === "TODO" ? "To Do" : "Done"}
            </button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
          {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
            <div key={status} className="bg-gray-100 rounded p-3">
              <h3 className="font-medium text-gray-600 text-sm mb-3">
                {status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Done"}
                <span className="ml-2 bg-white text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                  {tasksByStatus[status].length}
                </span>
              </h3>

              <div className="space-y-2">
                {tasksByStatus[status].map((task) => (
                  <div
                    key={task.id}
                    className={`bg-white rounded shadow-sm p-3 ${isOverdue(task) ? "border-l-4 border-red-400" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      {(myRole === "Admin" || task.createdBy?.id === user.id) && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-300 hover:text-red-400 text-xs ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className={`text-xs rounded px-1.5 py-0.5 border-0 ${statusColors[task.status]}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>

                      {task.assignedTo && (
                        <span className="text-xs text-gray-400">{task.assignedTo.name}</span>
                      )}
                    </div>

                    {task.dueDate && (
                      <p className={`text-xs mt-1 ${isOverdue(task) ? "text-red-500" : "text-gray-400"}`}>
                        due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}

                {tasksByStatus[status].length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">no tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden space-y-2 mb-8">
          {tasksByStatus[activeTab].map((task) => (
            <div key={task.id} className="bg-white rounded shadow p-3">
              <p className="font-medium text-sm text-gray-800">{task.title}</p>
              {task.assignedTo && (
                <p className="text-xs text-gray-400 mt-0.5">assigned to: {task.assignedTo.name}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded px-1.5 py-0.5"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                {isOverdue(task) && (
                  <span className="text-xs text-red-500">overdue</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">
              Team Members ({project.members.length})
            </h2>
            {myRole === "Admin" && (
              <button
                onClick={() => setShowMemberForm(!showMemberForm)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add Member
              </button>
            )}
          </div>

          {showMemberForm && (
            <form onSubmit={addMember} className="flex gap-2 mb-4 flex-wrap">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="user's email"
                className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 focus:outline-none focus:border-blue-500"
                required
                autoFocus
              />
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={addingMember}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {addingMember ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.user.name}</p>
                  <p className="text-xs text-gray-400">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPage