import mongoose from "mongoose";

export const employerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, default: "employer" },
    company: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    experience: { type: Number, default: null },
    designation: { type: String, default: null },
    domain: { type: String, default: null },
    profilePicture: {
      data: String,
      contentType: String,
    },
  },
  { timestamps: true }
);

export const Employer = mongoose.model("Employer", employerSchema);
