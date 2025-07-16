import mongoose from "mongoose";

export const jobsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  employerName: { type: String, required: true },
  domain: { type: String, required: true },
  description: {
    type: new mongoose.Schema({
      overview: { type: String, required: true },
      responsibilities: [{ type: String, required: true }],
      requiredSkills: [{ type: String, required: true }],
      preferredSkills: [{ type: String }],
      whatWeOffer: [{ type: String }],
    }, { _id: false }),
    required: true,
  },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  type: { type: String, required: true },
  applicantCount: { type: Number, default: 0 },
  experience: { type: Number, required: true },
  vacancies: { type: Number, required: true },
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Job = mongoose.model("Job", jobsSchema);
