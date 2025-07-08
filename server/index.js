const express = require("express");
const cors = require("cors");
const { getUserData } = require("../controllers/usersController");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: [`http://localhost:${process.env.CORS_ORIGIN_PORT}`],
    })
);

//API Routes Here
app.get("/", (req, res) => {
    res.send("Welcome to DBADM Proj!");
});

app.get("/get-users", async (req, res) => {
    try {
        const data = await getUserData();
        res.json(data);
    } catch (error) {
        console.error("Error getting data:", error);
        res.status(500).json({ error: "Error getting data" });
    }
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on http://localhost:", process.env.PORT)
});

