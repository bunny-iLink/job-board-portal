// controllers/notificationController.js
import { Notification } from '../models/notification.js';

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
