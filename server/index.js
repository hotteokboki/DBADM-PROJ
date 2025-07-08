const express = require("express");
const cors = require("cors");
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


app.listen(process.env.PORT, () => {
    console.log("Server is running on http://localhost:", process.env.PORT)
});

