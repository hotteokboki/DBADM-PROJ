const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes.js"); 
const authRoutes = require("./routes/authRoutes.js");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
    origin: [`http://localhost:${process.env.CORS_ORIGIN_PORT}`],
}));
app.use(express.json()); // Parse JSON body

// Routes
app.use("/api/users", userRoutes);
app.use("/auth", authRoutes)

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to DBADM Proj!");
});

module.exports = app;
