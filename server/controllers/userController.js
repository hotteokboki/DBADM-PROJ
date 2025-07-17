const { getUserData } = require("../models/usersModel");

const getUsers = async (req, res) => {
    try {
        const users = await getUserData();

        res.status(200).json({
            success: true,
            message: users.length > 0 ? "Users retrieved successfully" : "No users found",
            data: users
        });
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

module.exports = { getUsers };
