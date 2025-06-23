import { Notification } from "../models/notification.js";
import { Job } from "../models/jobs.js"; // import Job model

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching notifications for userId: ${userId}`);

    // Fetch notifications
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    console.log(`Fetched ${notifications.length} notifications`);

    res.status(200).json({ notifications: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
