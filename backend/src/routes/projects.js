const express = require("express")
const router = express.Router()
const { PrismaClient } = require("@prisma/client")
const protect = require("../middleware/authMiddleware")

const prisma = new PrismaClient()

// get all projects for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })

    res.json(projects)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

// create new project
router.post("/", protect, async (req, res) => {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ message: "project name is required" })
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        members: {
          create: {
            userId: req.userId,
            role: "Admin",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    res.status(201).json(project)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

// get single project
router.get("/:id", protect, async (req, res) => {
  const projectId = parseInt(req.params.id)

  try {
    // check if user is member of this project
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId,
          projectId: projectId,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ message: "you are not part of this project" })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    // also send back what role the current user has
    res.json({ ...project, myRole: membership.role })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

// add member to project - only admin can do this
router.post("/:id/members", protect, async (req, res) => {
  const projectId = parseInt(req.params.id)
  const { email, role } = req.body

  try {
    const myMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: req.userId, projectId },
      },
    })

    if (!myMembership || myMembership.role !== "Admin") {
      return res.status(403).json({ message: "only admins can add members" })
    }

    if (!email) {
      return res.status(400).json({ message: "email is required" })
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } })
    if (!userToAdd) {
      return res.status(404).json({ message: "no user found with that email" })
    }

    // check if already a member
    const alreadyMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: userToAdd.id, projectId },
      },
    })
    if (alreadyMember) {
      return res.status(400).json({ message: "user is already in this project" })
    }

    // TODO: maybe send email notification here later

    const newMember = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId,
        role: role === "Admin" ? "Admin" : "Member",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    res.json(newMember)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "server error" })
  }
})

module.exports = router
