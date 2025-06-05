import mongoose from "mongoose";

export const applicationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    jobId: { type: String, required: true },
    employer: { type: String, required: true },
    status: { type: String, default: 'pending' },
    appliedAt: { type: Date, default: Date.now },
})