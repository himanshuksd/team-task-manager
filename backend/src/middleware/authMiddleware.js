const jwt = require("jsonwebtoken")

function protect(req, res, next) {
  const authHeader = req.headers["authorization"]

  if (!authHeader) {
    return res.status(401).json({ message: "no token, not authorized" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    console.log("token error:", err.message)
    return res.status(401).json({ message: "token not valid" })
  }
}

module.exports = protect
