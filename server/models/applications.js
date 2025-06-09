import mongoose from "mongoose";

export const applicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    employer: { type: String, required: true },
    status: { type: String, enum: ["In Progress", "Accepted", "Rejected"], default: 'In Progress' },
    appliedAt: { type: Date, default: Date.now },
})

export const Application = mongoose.model("Application", applicationSchema);