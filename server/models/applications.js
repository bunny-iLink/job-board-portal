import mongoose from "mongoose";

export const applicationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    jobId: { type: String, required: true },
    employer: { type: String, required: true },
    status: { enum: ["In Progress", "Accepted", "Rejected"], default: 'In Progress' },
    appliedAt: { type: Date, default: Date.now },
})