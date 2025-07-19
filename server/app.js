const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const path = require('path');
const userRoutes = require("./routes/userRoutes.js"); 
const authRoutes = require("./routes/authRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js"); 
const productRoutes = require("./routes/productRoutes.js")
const discountsRoutes = require("./routes/discountsRoutes.js")

require("dotenv").config();
require("./utils/scheduler");
console.log("🔁 Scheduler loaded");

const app = express();

app.use(cors({
  origin: `http://localhost:${process.env.CORS_ORIGIN_PORT}`, // Or origin: true for dev
  credentials: true, // 🔥 Must be set to send cookies
}));

app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: false, // Set to true only if using HTTPS
    sameSite: "Lax", // 'Lax' works better with localhost
  }
}));

app.use(express.json());
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes); 
app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/discounts", discountsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to DBADM Proj!");
});

module.exports = app;