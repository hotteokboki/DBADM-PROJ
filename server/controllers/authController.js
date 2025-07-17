const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { checkExistingUser, createUser } = require("../models/usersModel") // example

const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(first_name, last_name, email, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    })

    return res.json({ token, user: { id: user._id, name: user.name } })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = { register, login };
