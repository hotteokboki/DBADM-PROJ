const { joinWaitlist, getWaitlist } = require("../models/waitlistModel");

const joinWaitlistController = async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ success: false, message: "Missing user or product ID" });
  }

  try {
    const result = await joinWaitlist(userId, productId);

    if (result.alreadyJoined) {
      return res.status(200).json({ success: true, message: "Already in waitlist" });
    }

    return res.status(201).json({ success: true, message: "Successfully joined waitlist" });
  } catch (err) {
    console.error("Error joining waitlist:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getWaitlistStatus = async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.params;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await getWaitlist(userId, productId);
    return res.status(200).json({ success: true, isJoined: result.isJoined });
  } catch (err) {
    console.error("Error checking waitlist status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  joinWaitlistController,
  getWaitlistStatus
};
