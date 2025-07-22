const bcrypt = require("bcrypt")
const { checkExistingUser, createUser, getUserByEmail } = require("../models/usersModel");
const { insertSession, deleteSession } = require("../models/sessionModel");

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
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Set session data
    req.session.user = {
      id: user.user_id,
      email: user.email,
      role: user.role_id,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    console.log("Login Session:", req.session);

    // Save to database session table
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const sessionId = req.sessionID;

    await insertSession(user.user_id, sessionId, expiresAt); // ✅ Save session ID to DB

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: req.session.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const checkSession = async (req, res) => {
  try {
    if (req.session && req.session.user) {
      return res.status(200).json({
        success: true,
        message: "User is logged in",
        data: req.session.user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "No active session",
      });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during session check",
    });
  }
};

const logout = async (req, res) => {
  try {
    const sessionId = req.sessionID;

    if (!req.session || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "No active session found.",
      });
    }

    // Optional: delete session manually from your sessions table
    await deleteSession(sessionId);

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          message: "Error while destroying session.",
        });
      }

      // Clear session cookie (default is connect.sid)
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

module.exports = { register, login, logout,checkSession };
