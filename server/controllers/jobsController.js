import mongoose from "mongoose";
import { jobsSchema } from "../models/jobs.js";

const Job = mongoose.model("Job", jobsSchema);

export async function addJob(req, res) {
    try {
        const {
            title,
            employerId,
            employerName,
            domain,
            description, // nested object expected
            company,
            location,
            salary,
            type,
            experience,
            vacancies,
            status
        } = req.body;

        // Validate required nested fields in description
        if (
            !description ||
            !description.overview ||
            !Array.isArray(description.responsibilities) ||
            !Array.isArray(description.requiredSkills)
        ) {
            return res.status(400).json({
                message: "Missing required fields in job description"
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
                whatWeOffer: description.whatWeOffer || []
            },
            company,
            location,
            salary,
            type,
            experience,
            vacancies,
            status: status || 'open' // Default to 'open' if not provided
        });

        const savedJob = await newJob.save();
        console.log("Job added successfully:", savedJob);
        return res.status(201).json({
            message: "Job added successfully"
        });
    } catch (err) {
        console.error("Error adding job:", err);
        return res.status(500).json({
            message: "Error adding job",
            error: err.message || err
        });
    }
}

export async function getJobs(req, res) {
    try {
        const employerId = req.params.employerId;

        let jobs;
        if (employerId) {
            // Get jobs for a specific employer
            jobs = await Job.find({ employerId });
        } else {
            console.log("No employerId received");
        }

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found" });
        }
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error.message);
        res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
}

