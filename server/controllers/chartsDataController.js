import { Job } from "../models/jobs.js";
import { Application } from "../models/applications.js";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
export async function getApplicationsDataForEmployerBasedOnStatus(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const results = await Application.aggregate([
      {
        $match: {
          employerId: new ObjectId(userId), // ✅ match employerId, not userId
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Ensure all 4 statuses are always included
    const allStatuses = ["Applied", "In Progress", "Accepted", "Rejected"];
    const statusCounts = {};
    allStatuses.forEach((status) => (statusCounts[status] = 0));

    results.forEach((r) => {
      statusCounts[r._id] = r.count;
    });

    return res.json(statusCounts);
  } catch (err) {
    console.error("Error in getApplicationsDataForEmployerBasedOnStatus:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getApplicationsByDomain(req, res) {
  const { userId } = req.params;

  try {
    const result = await Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $group: {
          _id: "$jobDetails.domain",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          domain: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json(result); // no custom formatting
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getApplicationsDataForUserBasedOnStatus(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const results = await Application.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const allStatuses = ["Applied", "In Progress", "Accepted", "Rejected"];
    const statusCounts = {};
    allStatuses.forEach((status) => (statusCounts[status] = 0));

    results.forEach((r) => {
      statusCounts[r._id] = r.count;
    });

    return res.json(statusCounts);
  } catch (err) {
    console.error("Error in getApplicationsDataForUserBasedOnStatus:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
