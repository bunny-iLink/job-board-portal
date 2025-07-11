import mongoose from "mongoose";
import { Job } from "../models/jobs.js";
import { Application } from "../models/applications.js";
import { User } from "../models/users.js";

export async function addJob(req, res) {
  console.log("[addJob] Incoming job data:", req.body);

  try {
    const {
      title,
      employerId,
      employerName,
      domain,
      description,
      company,
      location,
      salary,
      type,
      experience,
      vacancies,
      status,
    } = req.body;

    if (
      !description ||
      !description.overview ||
      !Array.isArray(description.responsibilities) ||
      !Array.isArray(description.requiredSkills)
    ) {
      console.warn("[addJob] Missing required fields in job description");
      return res.status(400).json({
        message: "Missing required fields in job description",
      });
    }

    const newJob = new Job({
      title,
      employerId,
      employerName,
      domain,
      description: {
        overview: description.overview,
        responsibilities: description.responsibilities,
        requiredSkills: description.requiredSkills,
        preferredSkills: description.preferredSkills || [],
        whatWeOffer: description.whatWeOffer || [],
      },
      company,
      location,
      salary,
      type,
      experience,
      vacancies,
      status: status || "open",
    });

    const savedJob = await newJob.save();
    console.log("[addJob] Job created:", savedJob._id);
    return res.status(201).json({ message: "Job added successfully" });
  } catch (err) {
    console.error("[addJob] Error:", err);
    return res
      .status(500)
      .json({ message: "Error adding job", error: err.message });
  }
}

export async function getJobsForEmployer(req, res) {
  const { employerId } = req.params;
  console.log("[getJobsForEmployer] employerId:", employerId);

  try {
    if (!employerId) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const jobs = await Job.find({ employerId });
    console.log(`[getJobsForEmployer] Found ${jobs.length} jobs`);

    if (!jobs.length) {
      return res
        .status(404)
        .json({ message: "No jobs found for this employer" });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error("[getJobsForEmployer] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export async function updateJob(req, res) {
  const { jobId } = req.params;
  const updateData = req.body;
  console.log("[updateJob] jobId:", jobId);
  console.log("[updateJob] updateData:", updateData);

  try {
    if (updateData.description) {
      const desc = updateData.description;

      if (desc.hasOwnProperty("overview") && !desc.overview) {
        return res
          .status(400)
          .json({ message: "Description overview cannot be empty" });
      }
      if (
        desc.hasOwnProperty("responsibilities") &&
        !Array.isArray(desc.responsibilities)
      ) {
        return res
          .status(400)
          .json({ message: "Responsibilities must be an array" });
      }
      if (
        desc.hasOwnProperty("requiredSkills") &&
        !Array.isArray(desc.requiredSkills)
      ) {
        return res
          .status(400)
          .json({ message: "Required skills must be an array" });
      }

      if (!desc.preferredSkills) desc.preferredSkills = [];
      if (!desc.whatWeOffer) desc.whatWeOffer = [];
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      console.warn("[updateJob] Job not found for ID:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("[updateJob] Job updated successfully:", updatedJob._id);
    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("[updateJob] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error updating job", error: error.message });
  }
}

export async function deleteJob(req, res) {
  const { jobId } = req.params;
  console.log("[deleteJob] jobId:", jobId);

  try {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }

    // First delete all related applications
    const deletedApplications = await Application.deleteMany({ jobId });
    console.info(
      `[deleteJob] Deleted ${deletedApplications.deletedCount} application(s) linked to jobId ${jobId}`
    );

    // Then delete the job itself
    const deletedJob = await Job.findByIdAndDelete(jobId);
    if (!deletedJob) {
      console.warn("[deleteJob] Job not found after deleting applications");
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("[deleteJob] Job deleted:", deletedJob._id);

    res.status(200).json({
      message: "Job and related applications deleted successfully",
      deletedApplications: deletedApplications.deletedCount,
      deletedJob,
    });
  } catch (error) {
    console.error("[deleteJob] Error:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting job", error: error.message });
  }
}

export async function getJobsSummaryForEmployer(req, res) {
  const { employerId } = req.params;
  console.log("[getJobsSummaryForEmployer] employerId:", employerId);

  try {
    const jobSummaries = await Job.find({ employerId }).select(
      "_id title vacancies applicantCount"
    );

    console.log(
      `[getJobsSummaryForEmployer] Found ${jobSummaries.length} summaries`
    );
    res.status(200).json(jobSummaries);
  } catch (error) {
    console.error("[getJobsSummaryForEmployer] Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getJobsByDomain(req, res) {
  const { domain, userId } = req.query;
  console.log("[getJobsByDomain] domain:", domain, "userId:", userId);

  try {
    if (!domain || !userId) {
      return res
        .status(400)
        .json({ message: "Domain and user ID are required." });
    }

    const appliedJobs = await Application.find({ userId }).select("jobId");
    const appliedJobIds = appliedJobs.map((app) => app.jobId.toString());

    const jobs = await Job.find({
      domain,
      status: "open",
      _id: { $nin: appliedJobIds },
    });

    console.log(
      `[getJobsByDomain] Found ${jobs.length} jobs in domain '${domain}' not applied by user`
    );
    res.status(200).json(jobs);
  } catch (err) {
    console.error("[getJobsByDomain] Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getJobById(req, res) {
  const jobId = req.params.jobId;
  console.log("[getJobById] jobId:", jobId);

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.warn("[getJobById] Job not found:", jobId);
      return res.status(404).json({ message: "Job not found" });
    }

    const applications = await Application.find({ jobId })
      .populate("userId")
      .sort({ appliedAt: -1 });

    console.log(
      `[getJobById] Found job with ${applications.length} applicants`
    );
    res.status(200).json({ job, applicants: applications });
  } catch (error) {
    console.error("[getJobById] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export async function searchJobsForUsers(req, res) {
  const queryParams = req.query;
  console.log("[searchJobsForUsers] Search Params:", queryParams);

  try {
    const {
      domain,
      experience,
      expectedSalary,
      type,
      search,
      userId,
      preferredDomain,
    } = req.query;

    const query = { status: "open" };

    // Apply domain or preferredDomain only when search is not present
    if (!search) {
      if (domain) {
        query.domain = domain;
      } else if (preferredDomain) {
        query.domain = preferredDomain;
      }
    }

    if (type) query.type = type;

    if (experience) {
      query.experience = { $lte: Number(experience) };
    }

    if (expectedSalary) {
      query.salary = { $gte: Number(expectedSalary) };
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { title: regex },
        { company: regex },
        { location: regex },
        { "description.overview": regex },
        { "description.requiredSkills": { $elemMatch: { $regex: regex } } },
        { "description.preferredSkills": { $elemMatch: { $regex: regex } } },
      ];
    }

    if (userId) {
      const appliedJobs = await Application.find({ userId }).select("jobId");
      const appliedJobIds = appliedJobs.map((app) => app.jobId.toString());
      query._id = { $nin: appliedJobIds };
    }

    console.log("Final Query Params:", query);
    const jobs = await Job.find(query);
    console.log(`[searchJobsForUsers] Found ${jobs.length} matching jobs`);
    res.status(200).json(jobs);
  } catch (error) {
    console.error("[searchJobsForUsers] Error:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
