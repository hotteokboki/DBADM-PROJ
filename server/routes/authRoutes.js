const express = require("express")
const router = express.Router()
const { register, login, logout} = require("../controllers/authController")

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

module.exports = router;
