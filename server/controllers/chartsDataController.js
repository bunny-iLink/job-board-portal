import { Job } from "../models/jobs.js";
import { Application } from "../models/applications.js";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';

export async function getApplicationsDataForEmployerBasedOnStatus(req, res) {
  try {
    const { employerId } = req.params;
    if (!employerId) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const results = await Application.aggregate([
      {
        $match: {
          employerId: new ObjectId(employerId) // Only match this employer's apps
        }
      },
      {
        $group: {
          _id: "$status",             // Group by status field
          count: { $sum: 1 }          // Count number of applications per status
        }
      }
    ]);

    // Optional: Ensure all 4 statuses are represented (even if 0)
    const allStatuses = ["Applied", "In Progress", "Accepted", "Rejected"];
    const statusCounts = {};
    allStatuses.forEach(status => (statusCounts[status] = 0));

    results.forEach(r => {
      statusCounts[r._id] = r.count;
    });

    return res.json(statusCounts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

