import { Notification } from "../models/notification.js";
import mongoose from "mongoose";

export const addNotification = async (userId, message) => {
    try {
        const notification = new Notification({ userId, message });
        await notification.save();
        console.info(`[notifyUser] Notification sent to user ${userId}`);
    } catch (err) {
        console.error(`[notifyUser] Failed to send notification to user ${userId}:`, err);
    }
};

export const getUserNotifications = async (req, res) => {
    const { userId } = req.params;
    const { page = 1 } = req.query; // default to page 1 if not provided
    const limit = 5;

    try {
        // Validate userId if it's an ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        console.log(`Fetching notifications for userId: ${userId}, page: ${page}`);

        const skip = (Number(page) - 1) * limit;

        // Fetch paginated notifications
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Optional: get total count for pagination info
        const total = await Notification.countDocuments({ userId });

        res.status(200).json({
            notifications,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const clearNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        // Validate userId if it's an ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        console.log(`Clearing notifications for userId: ${userId}`);

        // Delete all notifications for the user
        await Notification.deleteMany({ userId });

        res.status(200).json({ message: "Notifications cleared successfully." });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

