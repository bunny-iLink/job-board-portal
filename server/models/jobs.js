import mongoose from 'mongoose';

export const jobsSchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    employerId: { type: String, required: true },
    employerName: { type: String, required: true },
    domain: { type: String, required: true }, 
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: Number, required: true },
    type: { type: String, required: true }, 
    experience: { type: String, required: true },
    vacancies: { type: Number, required: true },
    status: { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})