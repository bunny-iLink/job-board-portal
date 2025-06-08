import mongoose from 'mongoose';

export const jobsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    employerId: { type: String, required: true },
    employerName: { type: String, required: true },
    domain: { type: String, required: true },
    description: {
        overview: { type: String, required: true },
        responsibilities: [{ type: String, required: true }],
        requiredSkills: [{ type: String, required: true }],
        preferredSkills: [{ type: String }],
        whatWeOffer: [{ type: String }]
    },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    type: { type: String, required: true },  // e.g., Full-Time, Contract, Remote
    experience: { type: String, required: true },
    vacancies: { type: Number, required: true },
    status: { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    applicantCount: { type: Number, default: 0 }

});
