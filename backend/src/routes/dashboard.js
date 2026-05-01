const express = require("express")
const router = express.Router()
const { PrismaClient } = require("@prisma/client")
const protect = require("../middleware/authMiddleware")

const prisma = new PrismaClient()

router.get("/", protect, async (req, res) => {
  try {
    const myTasks = await prisma.task.findMany({
      where: { assignedToId: req.userId },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const myProjects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.userId } },
      },
      select: {
        id: true,
        name: true,
        _count: { select: { tasks: true } },
      },
    })

    const now = new Date()
    let overdueCount = 0
    myTasks.forEach((task) => {
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE") {
        overdueCount++
      }
    })

    res.json({
      tasks: myTasks,
      projects: myProjects,
      overdueCount,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

module.exports = router
