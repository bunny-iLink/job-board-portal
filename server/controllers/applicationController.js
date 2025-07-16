import { Application } from "../models/applications.js";
import { Job } from "../models/jobs.js";
import { User } from "../models/users.js";
import { Notification } from "../models/notification.js";
import { changeApplicantCount, changeVacancyCount } from "../utils/jobUtilities.js";
import { addNotification } from "./notificationsController.js"; // Import notification utility
import mongoose from "mongoose";

export async function applyForJob(req, res) {
  console.log("[applyForJob] Request received:", req.body);
  const { userId, jobId } = req.body;

  if (!userId || !jobId) {
    return res.status(400).json({ message: "User ID and Job ID are required." });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid User ID or Job ID format." });
  }
  
  try {
    const [user, job] = await Promise.all([
      User.findById(userId),
      Job.findById(jobId),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    const application = new Application({
      userId,
      jobId,
      employer: job.employerName,
      employerId: job.employerId,
    });

    try {
      await application.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "You have already applied for this job." });
      }
      throw err;
    }

    await changeApplicantCount(jobId);

    res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("[applyForJob] Error applying for job:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
export async function getUserAppliedJobs(req, res) {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;  // Default: page 1
  const limit = parseInt(req.query.limit) || 5; // Default: 5 jobs per page

  console.log("[getUserAppliedJobs] Request received for user:", userId, `Page: ${page}, Limit: ${limit}`);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format." });
  }

  try {
    // Count total applications
    const totalApplications = await Application.countDocuments({ userId });

    // Fetch paginated applications
    const applications = await Application.find({ userId })
      .populate("jobId")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const appliedJobs = applications
      .filter(app => app.jobId)
      .map(app => ({
        applicationId: app._id,
        ...app.jobId,
        status: app.status,
      }));

    console.info(`[getUserAppliedJobs] Page ${page} - Retrieved ${appliedJobs.length} applications for user ${userId}`);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalApplications / limit),
      totalApplications,
      jobs: appliedJobs
    });
  } catch (err) {
    console.error("[getUserAppliedJobs] Error fetching applied jobs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const updateApplicationStatus = async (req, res) => {
  const applicationId = req.params.applicationId;
  const { status } = req.body;

  const validStatuses = ["In Progress", "Accepted", "Rejected"];

  console.log("[updateApplicationStatus] Request received for applicationId:", applicationId, "with status:", status);

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(400).json({ message: "Invalid application ID format." });
  }

  if (!validStatuses.includes(status)) {
    console.warn(`[updateApplicationStatus] Invalid status value: ${status}`);
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      console.warn(`[updateApplicationStatus] Application not found for id: ${applicationId}`);
      return res.status(404).json({ message: "Application not found." });
    }

    const previousStatus = application.status;
    if (status === previousStatus) {
      console.info(`[updateApplicationStatus] Status is unchanged.`);
      return res.status(200).json({ message: "Status is already up to date.", application });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      console.warn(`[updateApplicationStatus] Job not found for id: ${application.jobId}`);
      return res.status(404).json({ message: "Associated job not found." });
    }

    if (previousStatus !== "Accepted" && status === "Accepted") {
      if (job.vacancies <= 0) {
        return res.status(400).json({ message: "No vacancies available for this job." });
      }
      await changeVacancyCount(job._id, "dec");
    } else if (previousStatus === "Accepted" && status !== "Accepted") {
      await changeVacancyCount(job._id, "inc");
    }

    application.status = status;
    await application.save();

    await addNotification(application.userId, `Your application for the job "${job.title}" has been updated to '${status}'.`);

    res.status(200).json({
      message: "Application status updated and user notified.",
      application,
    });
  } catch (error) {
    console.error("[updateApplicationStatus] Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export async function revokeApplication(req, res) {
  const applicationId = req.params.application_id;
  console.log("[revokeApplication] Request received with application_id:", applicationId);

  try {
    // Validate ID
    if (!applicationId) {
      console.warn("[revokeApplication] Application ID is missing.");
      return res.status(400).json({ message: "Application ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      console.warn(`[revokeApplication] Invalid Application ID format: ${applicationId}`);
      return res.status(400).json({ message: "Invalid Application ID format" });
    }

    // Step 1: Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      console.warn(`[revokeApplication] No application found with id: ${applicationId}`);
      return res.status(404).json({ message: "Application not found" });
    }

    const jobId = application.jobId;

    // Step 2: Decrement applicant count
    await changeApplicantCount(jobId, 'dec');

    // Step 3: If application was accepted, increment vacancy
    if (application.status === "Accepted") {
      await changeVacancyCount(jobId, 'inc');
    }

    // Step 4: Delete application
    const deletedApplication = await Application.findByIdAndDelete(applicationId);
    console.info("[revokeApplication] Deleted application:", deletedApplication);

    res.status(200).json({
      message: "Application revoked successfully",
      deletedApplication,
    });

  } catch (err) {
    console.error("[revokeApplication] Error in revokeApplication:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

