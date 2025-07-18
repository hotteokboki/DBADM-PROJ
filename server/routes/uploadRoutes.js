const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Optional: reject non-JPG/PNG files (no PDF allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and PNG files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const imageUrl = `${process.env.BACKEND_PORT}/uploads/${req.file.filename}`;
    res.json({ success: true, message: "Image uploaded!", imageUrl });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
});

module.exports = router;