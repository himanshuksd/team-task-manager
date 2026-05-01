const express = require("express")
const router = express.Router()
const { PrismaClient } = require("@prisma/client")
const protect = require("../middleware/authMiddleware")

const prisma = new PrismaClient()

router.post("/", protect, async (req, res) => {
  const { title, description, projectId, assignedToId, dueDate } = req.body

  if (!title || !projectId) {
    return res.status(400).json({ message: "title and projectId are required" })
  }

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId,
          projectId: parseInt(projectId),
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ message: "you are not a member of this project" })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        projectId: parseInt(projectId),
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        createdById: req.userId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    res.status(201).json(task)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

// update task status
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body
  const taskId = parseInt(req.params.id)

  const allowed = ["TODO", "IN_PROGRESS", "DONE"]
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "invalid status value" })
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return res.status(404).json({ message: "task not found" })
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: req.userId, projectId: task.projectId },
      },
    })

    if (!membership) {
      return res.status(403).json({ message: "not authorized" })
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    res.json(updated)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

router.delete("/:id", protect, async (req, res) => {
  const taskId = parseInt(req.params.id)

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return res.status(404).json({ message: "task not found" })
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: req.userId, projectId: task.projectId },
      },
    })

    if (!membership) {
      return res.status(403).json({ message: "not authorized" })
    }

    // only admin or task creator can delete
    if (membership.role !== "Admin" && task.createdById !== req.userId) {
      return res.status(403).json({ message: "only admins or task creator can delete" })
    }

    await prisma.task.delete({ where: { id: taskId } })
    res.json({ message: "task deleted" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

module.exports = router
