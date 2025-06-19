import { Job } from "../models/jobs.js";
import { Application } from "../models/applications.js";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';

export async function getApplicationsDataForEmployerBasedOnStatus(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Employer ID is required" });
    }

    const results = await Application.aggregate([
      {
        $match: {
          userId: new ObjectId(userId)
        }
      },
      {
        $group: {
          _id: "$status",            
          count: { $sum: 1 }          
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

export async function getApplicationsByDomain(req, res) {
    const { userId } = req.params;

    try {
        const result = await Application.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: 'jobs', // MongoDB collection name (usually plural lowercase)
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            {
                $unwind: '$jobDetails'
            },
            {
                $group: {
                    _id: '$jobDetails.domain',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    domain: '$_id',
                    count: 1
                }
            }
        ]);

        // Convert array to desired format: [{ "domain": count }]
        const formatted = result.map(item => ({ [item.domain]: item.count }));

        res.status(200).json(formatted);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


