import mongoose from 'mongoose';
import { Job } from '../../models/jobs.js';

describe('Job Model', () => {
    it('should fail validation if required fields are missing', async () => {
        const job = new Job({});
        let err;

        try {
            await job.validate();
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
        expect(err.errors.title).toBeDefined();
        expect(err.errors.employerId).toBeDefined();
        expect(err.errors.domain).toBeDefined();
        expect(err.errors.description).toBeDefined();
        expect(err.errors.company).toBeDefined();
        expect(err.errors.location).toBeDefined();
        expect(err.errors.salary).toBeDefined();
        expect(err.errors.type).toBeDefined();
        expect(err.errors.experience).toBeDefined();
        expect(err.errors.vacancies).toBeDefined();
    });

    it('should save successfully with valid data', async () => {
        const job = new Job({
            title: 'Full Stack Developer',
            employerId: new mongoose.Types.ObjectId(),
            employerName: 'Tech Corp',
            domain: 'Software Development',
            description: {
                overview: 'Build and maintain web applications',
                responsibilities: ['Write code', 'Fix bugs'],
                requiredSkills: ['JavaScript', 'Node.js'],
                preferredSkills: ['React', 'Docker'],
                whatWeOffer: ['Flexible hours', 'Remote work'],
            },
            company: 'Tech Corp',
            location: 'San Francisco',
            salary: 120000,
            type: 'Full-Time',
            experience: 2,
            vacancies: 3,
        });

        const saved = await job.save();

        expect(saved._id).toBeDefined();
        expect(saved.title).toBe('Full Stack Developer');
        expect(saved.description.overview).toBeDefined();
        expect(saved.description.requiredSkills.length).toBeGreaterThan(0);
        expect(saved.applicantCount).toBe(0);
        expect(saved.status).toBe('open');
    });

    it('should default applicantCount to 0 and status to "open"', async () => {
        const job = new Job({
            title: 'Backend Engineer',
            employerId: new mongoose.Types.ObjectId(),
            employerName: 'CloudOps',
            domain: 'Cloud',
            description: {
                overview: 'Build backend systems',
                responsibilities: ['APIs', 'Database'],
                requiredSkills: ['Node.js', 'MongoDB'],
            },
            company: 'CloudOps',
            location: 'Remote',
            salary: 95000,
            type: 'Contract',
            experience: 3,
            vacancies: 2,
        });

        const saved = await job.save();
        expect(saved.applicantCount).toBe(0);
        expect(saved.status).toBe('open');
    });
});
