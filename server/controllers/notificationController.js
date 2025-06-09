import { Notification } from '../models/notification.js';
import { Job } from '../models/jobs.js';  // import Job model

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch notifications for the user
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        // Extract all jobIds from notifications message
        // Assuming the jobId is embedded in the message like "job ID 6846645a95ebb5928273ecb8"
        const jobIds = notifications.map(n => {
            const match = n.message.match(/job ID (\w+)/);
            return match ? match[1] : null;
        }).filter(id => id !== null);

        // Fetch all jobs by these ids
        const jobs = await Job.find({ _id: { $in: jobIds } });

        // Create a map of jobId -> title for quick lookup
        const jobIdToTitle = {};
        jobs.forEach(job => {
            jobIdToTitle[job._id] = job.title;
        });

        // Replace jobId with job title in each notification message
        const updatedNotifications = notifications.map(n => {
            return {
                ...n.toObject(),
                message: n.message.replace(/job ID (\w+)/, (_, id) => {
                    return jobIdToTitle[id] || id; // replace with title if found, else keep id
                })
            };
        });

        res.status(200).json({ notifications: updatedNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
