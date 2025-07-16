import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';

import * as jobsController from '../../controllers/jobsController.js';

jest.mock('../../models/jobs.js', () => ({
    Job: {
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn()
    }
}));

jest.mock('../../models/applications.js', () => ({
    Application: {
        find: jest.fn(),
        deleteMany: jest.fn()
    }
}));

const { Job } = await import('../../models/jobs.js');
const { Application } = await import('../../models/applications.js');

describe('Jobs Controller', () => {
    afterEach(() => jest.clearAllMocks());

    describe('addJob', () => {
        test('should return 400 if required description fields are missing', async () => {
            const req = httpMocks.createRequest({ body: { description: {} } });
            const res = httpMocks.createResponse();

            await jobsController.addJob(req, res);
            expect(res.statusCode).toBe(400);
        });
    });

    describe('getJobsForEmployer', () => {
        test('should return 400 if employerId is missing', async () => {
            const req = httpMocks.createRequest({ params: {} });
            const res = httpMocks.createResponse();

            await jobsController.getJobsForEmployer(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if no jobs found', async () => {
            Job.find.mockResolvedValue([]);
            const req = httpMocks.createRequest({ params: { employerId: '123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobsForEmployer(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should return 200 with jobs if found', async () => {
            Job.find.mockResolvedValue([{ title: 'Job1' }]);
            const req = httpMocks.createRequest({ params: { employerId: '123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobsForEmployer(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('updateJob', () => {
        test('should return 400 if responsibilities is not an array', async () => {
            const req = httpMocks.createRequest({
                params: { jobId: 'job123' },
                body: {
                    description: { responsibilities: 'not-array' }
                }
            });
            const res = httpMocks.createResponse();

            await jobsController.updateJob(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if job not found', async () => {
            Job.findByIdAndUpdate.mockResolvedValue(null);
            const req = httpMocks.createRequest({
                params: { jobId: 'job123' },
                body: {}
            });
            const res = httpMocks.createResponse();

            await jobsController.updateJob(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should update job and return 200', async () => {
            Job.findByIdAndUpdate.mockResolvedValue({ _id: 'job123', title: 'Updated Job' });
            const req = httpMocks.createRequest({
                params: { jobId: 'job123' },
                body: { title: 'Updated Job' }
            });
            const res = httpMocks.createResponse();

            await jobsController.updateJob(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('deleteJob', () => {
        test('should return 400 on invalid jobId', async () => {
            const req = httpMocks.createRequest({ params: { jobId: 'invalid-id' } });
            const res = httpMocks.createResponse();

            await jobsController.deleteJob(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if job not found', async () => {
            mongoose.Types.ObjectId.isValid = () => true;
            Application.deleteMany.mockResolvedValue({ deletedCount: 0 });
            Job.findByIdAndDelete.mockResolvedValue(null);

            const req = httpMocks.createRequest({ params: { jobId: 'validid123' } });
            const res = httpMocks.createResponse();

            await jobsController.deleteJob(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should delete job and return 200', async () => {
            mongoose.Types.ObjectId.isValid = () => true;
            Application.deleteMany.mockResolvedValue({ deletedCount: 3 });
            Job.findByIdAndDelete.mockResolvedValue({ _id: 'validid123' });

            const req = httpMocks.createRequest({ params: { jobId: 'validid123' } });
            const res = httpMocks.createResponse();

            await jobsController.deleteJob(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('getJobsSummaryForEmployer', () => {
        test('should return 200 with job summaries', async () => {
            Job.find.mockResolvedValue([{ _id: '1', title: 'A', vacancies: 3, applicantCount: 5 }]);
            const req = httpMocks.createRequest({ params: { employerId: 'emp123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobsSummaryForEmployer(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('getJobsByDomain', () => {
        test('should return 400 if domain or userId missing', async () => {
            const req = httpMocks.createRequest({ query: {} });
            const res = httpMocks.createResponse();

            await jobsController.getJobsByDomain(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 200 with filtered jobs', async () => {
            Application.find.mockResolvedValue([{ jobId: 'abc' }]);
            Job.find.mockResolvedValue([{ title: 'Job1' }]);

            const req = httpMocks.createRequest({ query: { domain: 'Tech', userId: 'u123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobsByDomain(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('getJobById', () => {
        test('should return 404 if job not found', async () => {
            Job.findById.mockResolvedValue(null);

            const req = httpMocks.createRequest({ params: { jobId: 'j123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobById(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should return 200 with job and applicants', async () => {
            Job.findById.mockResolvedValue({ title: 'Job1' });
            Application.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) }) });

            const req = httpMocks.createRequest({ params: { jobId: 'j123' } });
            const res = httpMocks.createResponse();

            await jobsController.getJobById(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('searchJobsForUsers', () => {
        test('should return 200 with filtered jobs and pagination', async () => {
            Application.find.mockResolvedValue([]);
            Job.find.mockResolvedValue([{ title: 'Job' }]);
            Job.countDocuments.mockResolvedValue(1);

            const req = httpMocks.createRequest({ query: { page: '1', userId: 'u1' } });
            const res = httpMocks.createResponse();

            await jobsController.searchJobsForUsers(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toHaveProperty('pagination');
        });
    });
});
