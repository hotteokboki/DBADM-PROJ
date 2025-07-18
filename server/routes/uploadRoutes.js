const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Save to /server/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  const imageUrl = `${process.env.BACKEND_PORT}/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

module.exports = router;