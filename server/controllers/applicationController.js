import { Application } from '../models/applications.js';
import { Job } from '../models/jobs.js';
import { User } from '../models/users.js';
import { Notification } from '../models/notification.js';
import mongoose from 'mongoose';

export async function applyForJob(req, res) {
    try {
        const { userId, jobId } = req.body;

        if (!userId || !jobId) {
            return res.status(400).json({ message: 'User ID and Job ID are required.' });
        }

        const user = await User.findById(userId);
        const job = await Job.findById(jobId);

        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (!job) return res.status(404).json({ message: 'Job not found.' });

        const existingApplication = await Application.findOne({ userId, jobId });

        if (existingApplication) {
            return res.status(409).json({ message: 'You have already applied for this job.' });
        }

        const application = new Application({
            userId,
            jobId,
            employer: job.employerName,
        });

        await application.save();

        job.applicantCount += 1;
        await job.save();

        res.status(201).json({ message: 'Application submitted successfully.', application });

    } catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        console.log("applicationId:", applicationId);

        const { status } = req.body;

        const validStatuses = ["In Progress", "Accepted", "Rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        const previousStatus = application.status;

        // If status is changing to Accepted, reduce job vacancy
        if (status === "Accepted" && previousStatus !== "Accepted") {
            const job = await Job.findById(application.jobId);
            if (!job) {
                return res.status(404).json({ message: "Associated job not found." });
            }

            if (job.vacancies <= 0) {
                return res.status(400).json({ message: "No vacancies available for this job." });
            }

            job.vacancies -= 1;
            await job.save();
        }

        application.status = status;
        await application.save();

        // ✅ Create a notification for the user
        const notification = new Notification({
            userId: application.userId,
            message: `Your application for job ID ${application.jobId} has been updated to '${status}'.`
        });

        await notification.save();

        res.status(200).json({ message: "Application status updated and user notified.", application });

    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export async function getUserAppliedJobs(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Fetch all applications by the user, and populate full job details
        const applications = await Application.find({ userId })
            .populate('jobId')  // Populate full job object
            .exec();

        // Combine job details with application status
        const appliedJobs = applications.map(app => ({
            applicationId: app._id,  
            ...app.jobId?.toObject(), // Convert Mongoose document to plain object
            status: app.status
        }));

        res.status(200).json(appliedJobs);
    } catch (err) {
        console.error('Error fetching applied jobs:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function revokeApplication(req, res) {
    try {
        const application_id = req.params.application_id;
        console.log("Received applicationId:", application_id); // Debug log

        if (!application_id) {
            return res.status(400).json({ message: "Application ID is required" });
        }

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(application_id)) {
            return res.status(400).json({ message: "Invalid Application ID format" });
        }

        const deletedApplication = await Application.findByIdAndDelete(application_id);
        console.log("Deleted document:", deletedApplication); // Debug log

        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({
            message: "Application deleted successfully",
            deletedApplication,
        });

    } catch (err) {
        console.error("Error in revokeApplication:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}




