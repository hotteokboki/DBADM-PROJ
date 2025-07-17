const { getUserData } = require("../models/usersModel");

const getUsers = async (req, res) => {
    try {
        const users = await getUserData();
        res.json(users);
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

module.exports = { getUsers };
