import mongoose from "mongoose";
import { jobsSchema } from "../models/jobs.js";
import { applicationSchema } from "../models/applications.js";
import { userSchema } from "../models/users.js";

const Job = mongoose.model("Job", jobsSchema);
const Application = mongoose.model("Application", applicationSchema);
const User = mongoose.model("User", userSchema);


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

export async function getJobsForEmployer(req, res) {
    try {
        const { employerId } = req.params;

        if (!employerId) {
            return res.status(400).json({ message: "Employer ID is required" });
        }

        const jobs = await Job.find({ employerId });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ message: "No jobs found for this employer" });
        }

        const jobsWithApplicantCount = await Promise.all(
            jobs.map(async (job) => {
                const count = await Application.countDocuments({ jobId: job._id });
                return {
                    ...job.toObject(),
                    applicantCount: count,
                };
            })
        );

        res.status(200).json(jobsWithApplicantCount);
    } catch (error) {
        console.error("Error fetching employer jobs:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


export async function updateJob(req, res) {
    try {
        const { jobId } = req.params;

        const updateData = req.body;

        // If 'description' is provided, do partial validation only on provided nested fields
        if (updateData.description) {
            const desc = updateData.description;

            if (desc.hasOwnProperty("overview") && !desc.overview) {
                return res.status(400).json({ message: "Description overview cannot be empty" });
            }

            if (desc.hasOwnProperty("responsibilities") && !Array.isArray(desc.responsibilities)) {
                return res.status(400).json({ message: "Responsibilities must be an array" });
            }

            if (desc.hasOwnProperty("requiredSkills") && !Array.isArray(desc.requiredSkills)) {
                return res.status(400).json({ message: "Required skills must be an array" });
            }

            // Optional fields fallback to empty arrays if explicitly passed as null or undefined
            if (!desc.preferredSkills) desc.preferredSkills = [];
            if (!desc.whatWeOffer) desc.whatWeOffer = [];
        }

        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({
            message: "Job updated successfully",
            job: updatedJob
        });
    } catch (error) {
        console.error("Error updating job:", error.message);
        res.status(500).json({ message: "Error updating job", error: error.message });
    }
}

export async function deleteJob(req, res) {
    try {
        const { jobId } = req.params;

        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Invalid job ID format" });
        }

        const deletedJob = await Job.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.status(200).json({
            message: "Job deleted successfully",
            job: deletedJob
        });
    } catch (error) {
        console.error("Error deleting job:", error.message);
        res.status(500).json({ message: "Error deleting job", error: error.message });
    }
}

export async function getJobsSummaryForEmployer(req, res) {
    try {
        const { employerId } = req.params;

        const jobs = await Job.find({ employerId }).select('_id title vacancies');

        const jobSummaries = await Promise.all(
            jobs.map(async job => {
                const applicantCount = await Application.countDocuments({ jobId: job._id });
                return {
                    _id: job._id,
                    title: job.title,
                    vacancies: job.vacancies,
                    applicantCount
                };
            })
        );

        res.status(200).json(jobSummaries);
    } catch (error) {
        console.error('Error getting job summaries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getJobsByDomain(req, res) {
    try {
        const { domain, userId } = req.query;

        if (!domain || !userId) {
            return res.status(400).json({ message: 'Domain and user ID are required.' });
        }

        // Get all jobIds the user has already applied for
        const appliedJobs = await Application.find({ userId }).select('jobId');
        const appliedJobIds = appliedJobs.map(app => app.jobId.toString());

        // Get jobs matching the domain, excluding already applied ones, and only those with status 'open'
        const jobs = await Job.find({
            domain,
            status: 'open',
            _id: { $nin: appliedJobIds }
        });

        res.status(200).json(jobs);
    } catch (err) {
        console.error("Error fetching jobs by domain:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}


export async function getJobById(req, res) {
    try {
        const jobId = req.params.jobId;

        // Fetch the job
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Fetch applications and populate full user info
        const applications = await Application.find({ jobId })
            .populate('userId') // populate all user fields
            .sort({ appliedAt: -1 });

        res.status(200).json({
            job,
            applicants: applications
        });
    } catch (error) {
        console.error("Error fetching job details and applicants:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export async function searchJobsForUsers(req, res) {
    try {
        const {
            domain,
            experience,
            minSalary,
            maxSalary,
            type,
            search,
            userId // optional: if passed, exclude already-applied jobs
        } = req.query;

        const query = {
            status: 'open'
        };

        // Build dynamic query
        if (domain) query.domain = domain;
        if (type) query.type = type;
        if (experience) query.experience = { $lte: Number(experience) };
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) query.salary.$gte = Number(minSalary);
            if (maxSalary) query.salary.$lte = Number(maxSalary);
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { company: regex },
                { location: regex },
                { 'description.overview': regex }
            ];
        }

        // Exclude already applied jobs if userId is passed
        if (userId) {
            const appliedJobs = await Application.find({ userId }).select('jobId');
            const appliedJobIds = appliedJobs.map(app => app.jobId.toString());
            query._id = { $nin: appliedJobIds };
        }

        const jobs = await Job.find(query);

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error searching jobs:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

