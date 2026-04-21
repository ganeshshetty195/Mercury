const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // 1. read the Authorization header
  const authHeader = req.headers['authorization']
  console.log(authHeader)
  // 2. check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  // 3. extract the token
  const token = authHeader.split(' ')[1]
  // "Bearer eyJhbGci..." → ["Bearer", "eyJhbGci..."] → [1]

  // 4. verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'] // always whitelist algorithm
    })

    // 5. attach userId to request object
    req.user = decoded

    // 6. move to next middleware / route handler
    next()

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware;
