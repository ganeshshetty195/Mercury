const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../database/pool')

// ─── REGISTER ───────────────────────────────────────────
const register = async (req, res) => {
  const { email, password } = req.body

  // 1. basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    // 2. check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // 3. hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 4. save user to DB
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    )

    const newUser = result.rows[0]

    // 5. return success
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── LOGIN ───────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body

  // 1. basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    // 2. find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // 3. compare password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // 4. generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // 5. return token
    res.status(200).json({
      message: 'Login successful',
      accessToken
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { register, login }