import { Notification } from '../models/notification.js';
import { Job } from '../models/jobs.js';  // import Job model

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching notifications for userId: ${userId}`);

        // Fetch notifications
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        console.log(`Fetched ${notifications.length} notifications`);

        // Extract job IDs from messages
        const jobIds = notifications.map(n => {
            const match = n.message.match(/job ID (\w+)/);
            return match ? match[1] : null;
        }).filter(id => id !== null);

        console.log(`Extracted ${jobIds.length} job IDs from notification messages:`, jobIds);

        // Fetch corresponding jobs
        const jobs = await Job.find({ _id: { $in: jobIds } });
        console.log(`Fetched ${jobs.length} jobs for extracted job IDs`);

        // Create map of jobId to title
        const jobIdToTitle = {};
        jobs.forEach(job => {
            jobIdToTitle[job._id] = job.title;
        });

        console.log("Job ID to title mapping created:", jobIdToTitle);

        // Update messages
        const updatedNotifications = notifications.map(n => {
            const updatedMessage = n.message.replace(/job ID (\w+)/, (_, id) => {
                return jobIdToTitle[id] || id;
            });

            return {
                ...n.toObject(),
                message: updatedMessage
            };
        });

        console.log(`Returning ${updatedNotifications.length} updated notifications`);

        res.status(200).json({ notifications: updatedNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
