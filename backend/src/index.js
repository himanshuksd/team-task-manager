const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()


const allowedOrigins = [
  process.env.FRONTEND_URL,        
  "http://localhost:5173",         
  "http://localhost:3000",          
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())


const authRoutes = require("./routes/auth")
const projectRoutes = require("./routes/projects")
const taskRoutes = require("./routes/tasks")
const dashboardRoutes = require("./routes/dashboard")

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/", (req, res) => {
  res.send("api is running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("server started on port " + PORT)
})