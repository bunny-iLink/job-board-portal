import { Application } from "../models/applications.js";
import { Job } from "../models/jobs.js";
import { User } from "../models/users.js";
import { Notification } from "../models/notification.js";
import mongoose from "mongoose";

export async function applyForJob(req, res) {
  console.log("[applyForJob] Request received:", req.body);
  try {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      console.warn("[applyForJob] Missing userId or jobId");
      return res
        .status(400)
        .json({ message: "User ID and Job ID are required." });
    }

    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user) {
      console.warn(`[applyForJob] User not found: ${userId}`);
      return res.status(404).json({ message: "User not found." });
    }
    if (!job) {
      console.warn(`[applyForJob] Job not found: ${jobId}`);
      return res.status(404).json({ message: "Job not found." });
    }

    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      console.warn(
        `[applyForJob] Duplicate application found for user ${userId} and job ${jobId}`
      );
      return res
        .status(409)
        .json({ message: "You have already applied for this job." });
    }

    const application = new Application({
      userId,
      jobId,
      employer: job.employerName,
      employerId: job.employerId,
    });
    await application.save();
    console.info(
      `[applyForJob] Application saved for user ${userId} and job ${jobId}`
    );

    // ✅ Use atomic increment for better concurrency safety
    await Job.updateOne({ _id: jobId }, { $inc: { applicantCount: 1 } });
    console.info(`[applyForJob] applicantCount incremented for job ${jobId}`);

    res
      .status(201)
      .json({ message: "Application submitted successfully.", application });
  } catch (error) {
    console.error("[applyForJob] Error applying for job:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const updateApplicationStatus = async (req, res) => {
  console.log(
    "[updateApplicationStatus] Request received for applicationId:",
    req.params.applicationId,
    "with body:",
    req.body
  );

  try {
    const applicationId = req.params.applicationId;
    const { status } = req.body;
    const validStatuses = ["In Progress", "Accepted", "Rejected"];

    if (!validStatuses.includes(status)) {
      console.warn(`[updateApplicationStatus] Invalid status value: ${status}`);
      return res.status(400).json({ message: "Invalid status value." });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      console.warn(
        `[updateApplicationStatus] Application not found for id: ${applicationId}`
      );
      return res.status(404).json({ message: "Application not found." });
    }

    console.info(
      `[updateApplicationStatus] Current status for application ${applicationId}: ${application.status}`
    );
    const previousStatus = application.status;

    const job = await Job.findById(application.jobId);
    if (!job) {
      console.warn(
        `[updateApplicationStatus] Associated job not found for application ${applicationId}`
      );
      return res.status(404).json({ message: "Associated job not found." });
    }

    // If status is changing to Accepted, reduce job vacancy
    if (status === "Accepted" && previousStatus !== "Accepted") {
      if (job.vacancies <= 0) {
        console.warn(
          `[updateApplicationStatus] No vacancies available for job ${job._id}`
        );
        return res
          .status(400)
          .json({ message: "No vacancies available for this job." });
      }

      job.vacancies -= 1;
      await job.save();
      console.info(
        `[updateApplicationStatus] Decreased vacancies for job ${job._id}, new vacancies: ${job.vacancies}`
      );
    }

    // If status is changing from Accepted to Rejected, increase job vacancy
    if (
      (previousStatus === "Accepted" || previousStatus === "In Progress") &&
      status === "Rejected"
    ) {
      job.vacancies += 1;
      await job.save();
      console.info(
        `[updateApplicationStatus] Increased vacancies for job ${job._id}, new vacancies: ${job.vacancies}`
      );
    }

    application.status = status;
    await application.save();
    console.info(
      `[updateApplicationStatus] Application ${applicationId} status updated to ${status}`
    );

    const notification = new Notification({
      userId: application.userId,
      message: `Your application for the job "${job.title}" has been updated to '${status}'.`,
    });
    await notification.save();
    console.info(
      `[updateApplicationStatus] Notification created for user ${application.userId}`
    );

    res
      .status(200)
      .json({
        message: "Application status updated and user notified.",
        application,
      });
  } catch (error) {
    console.error(
      "[updateApplicationStatus] Error updating application status:",
      error
    );
    res.status(500).json({ message: "Internal server error." });
  }
};

export async function getUserAppliedJobs(req, res) {
  console.log(
    "[getUserAppliedJobs] Request received for user:",
    req.params.userId
  );
  try {
    const { userId } = req.params;
    if (!userId) {
      console.warn("[getUserAppliedJobs] Missing userId");
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch all applications by the user, and populate full job details
    const applications = await Application.find({ userId })
      .populate("jobId") // Populate full job object
      .exec();

    console.info(
      `[getUserAppliedJobs] Retrieved ${applications.length} applications for user ${userId}`
    );

    // Combine job details with application status
    const appliedJobs = applications.map((app) => ({
      applicationId: app._id,
      ...app.jobId?.toObject(), // Convert Mongoose document to plain object
      status: app.status,
    }));

    res.status(200).json(appliedJobs);
  } catch (err) {
    console.error("[getUserAppliedJobs] Error fetching applied jobs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function revokeApplication(req, res) {
  console.log(
    "[revokeApplication] Request received with application_id:",
    req.params.application_id
  );
  try {
    const application_id = req.params.application_id;

    if (!application_id) {
      console.warn("[revokeApplication] Application ID is missing.");
      return res.status(400).json({ message: "Application ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(application_id)) {
      console.warn(
        `[revokeApplication] Invalid Application ID format: ${application_id}`
      );
      return res.status(400).json({ message: "Invalid Application ID format" });
    }

    // Find application first (don't delete yet)
    const application = await Application.findById(application_id);
    if (!application) {
      console.warn(
        `[revokeApplication] No application found with id: ${application_id}`
      );
      return res.status(404).json({ message: "Application not found" });
    }

    // If application was accepted, increase the job vacancy

    const job = await Job.findById(application.jobId);
    if (!job) {
      console.warn(
        `[revokeApplication] Job not found for jobId: ${application.jobId}`
      );
      return res.status(404).json({ message: "Job not found" });
    } else {
      job.applicantCount -= 1;
      await job.save();
      console.info(
        `[revokeApplication] Decreased applicantCount for job ${job._id}, new count: ${job.applicantCount}`
      );
    }

    if (application.status === "Accepted") {
      const job = await Job.findById(application.jobId);
      if (job) {
        job.vacancies += 1;
        await job.save();
        console.info(
          `[revokeApplication] Job vacancies incremented. Job ID: ${job._id}, new vacancies: ${job.vacancies}`
        );
      } else {
        console.warn(
          `[revokeApplication] Job not found for jobId: ${application.jobId}`
        );
      }
    }

    // Now delete the application
    const deletedApplication = await Application.findByIdAndDelete(
      application_id
    );
    console.info(
      "[revokeApplication] Deleted application:",
      deletedApplication
    );

    res.status(200).json({
      message: "Application revoked successfully",
      deletedApplication,
    });
  } catch (err) {
    console.error("[revokeApplication] Error in revokeApplication:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
