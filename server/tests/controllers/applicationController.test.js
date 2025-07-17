import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';

import {
    applyForJob,
    getUserAppliedJobs,
    updateApplicationStatus,
    revokeApplication
} from '../../controllers/applicationController.js';

// Mock Models
const saveMock = jest.fn();

jest.mock('../../models/applications.js', () => {
    const ApplicationMock = jest.fn(() => ({
        save: saveMock
    }));

    ApplicationMock.findById = jest.fn();
    ApplicationMock.findByIdAndDelete = jest.fn();
    ApplicationMock.find = jest.fn();
    ApplicationMock.countDocuments = jest.fn();

    return {
        Application: ApplicationMock,
        __esModule: true
    };
});

jest.mock('../../models/jobs.js', () => ({
    Job: {
        findById: jest.fn()
    },
    __esModule: true
}));

jest.mock('../../models/users.js', () => ({
    User: {
        findById: jest.fn()
    },
    __esModule: true
}));

jest.mock('../../utils/jobUtilities.js', () => ({
    changeApplicantCount: jest.fn(),
    changeVacancyCount: jest.fn(),
    __esModule: true
}));

jest.mock('../../controllers/notificationsController.js', () => ({
    addNotification: jest.fn(),
    __esModule: true
}));

const { Application } = await import('../../models/applications.js');
const { Job } = await import('../../models/jobs.js');
const { User } = await import('../../models/users.js');
const { changeApplicantCount, changeVacancyCount } = await import('../../utils/jobUtilities.js');
const { addNotification } = await import('../../controllers/notificationsController.js');

describe('applicationController', () => {
    afterEach(() => {
        jest.clearAllMocks();
        saveMock.mockReset();
    });

    describe('applyForJob', () => {
        test('should return 400 if userId or jobId missing', async () => {
            const req = httpMocks.createRequest({ body: {} });
            const res = httpMocks.createResponse();

            await applyForJob(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if user or job not found', async () => {
            const req = httpMocks.createRequest({
                body: {
                    userId: new mongoose.Types.ObjectId(),
                    jobId: new mongoose.Types.ObjectId()
                }
            });
            const res = httpMocks.createResponse();

            User.findById.mockResolvedValue(null);
            Job.findById.mockResolvedValue(null);

            await applyForJob(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should return 409 if application already exists (duplicate key)', async () => {
            const req = httpMocks.createRequest({
                body: {
                    userId: new mongoose.Types.ObjectId(),
                    jobId: new mongoose.Types.ObjectId()
                }
            });
            const res = httpMocks.createResponse();

            const mockJob = { employerName: 'ABC Inc.', employerId: 'employer123' };

            User.findById.mockResolvedValue({ name: 'Test User' });
            Job.findById.mockResolvedValue(mockJob);

            saveMock.mockRejectedValue({ code: 11000 });

            await applyForJob(req, res);
            expect(res.statusCode).toBe(409);
        });

        test('should save application and update applicant count', async () => {
            const req = httpMocks.createRequest({
                body: {
                    userId: new mongoose.Types.ObjectId(),
                    jobId: new mongoose.Types.ObjectId()
                }
            });
            const res = httpMocks.createResponse();

            const mockJob = { employerName: 'ABC Inc.', employerId: 'employer123' };

            User.findById.mockResolvedValue({ name: 'Test User' });
            Job.findById.mockResolvedValue(mockJob);
            saveMock.mockResolvedValue({});

            await applyForJob(req, res);

            expect(changeApplicantCount).toHaveBeenCalled();
            expect(saveMock).toHaveBeenCalled();
            expect(res.statusCode).toBe(201);
        });
    });

    describe('getUserAppliedJobs', () => {
        test('should return 400 for invalid userId', async () => {
            const req = httpMocks.createRequest({ params: { userId: 'invalid' } });
            const res = httpMocks.createResponse();

            await getUserAppliedJobs(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return paginated jobs', async () => {
            const validId = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({
                params: { userId: validId },
                query: { page: 1, limit: 2 }
            });
            const res = httpMocks.createResponse();

            Application.countDocuments.mockResolvedValue(3);
            Application.find.mockReturnValue({
                populate: () => ({
                    skip: () => ({
                        limit: () => ({
                            lean: () => Promise.resolve([
                                { _id: '1', jobId: { title: 'Job 1' }, status: 'In Progress' },
                                { _id: '2', jobId: { title: 'Job 2' }, status: 'Accepted' }
                            ])
                        })
                    })
                })
            });

            await getUserAppliedJobs(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().jobs).toHaveLength(2);
        });
    });

    describe('updateApplicationStatus', () => {
        test('should return 400 for invalid applicationId or status', async () => {
            const req = httpMocks.createRequest({
                params: { applicationId: 'badId' },
                body: { status: 'invalid' }
            });
            const res = httpMocks.createResponse();

            await updateApplicationStatus(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if application not found', async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({
                params: { applicationId: id },
                body: { status: 'Accepted' }
            });
            const res = httpMocks.createResponse();

            Application.findById.mockResolvedValue(null);

            await updateApplicationStatus(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should update application status and notify user', async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({
                params: { applicationId: id },
                body: { status: 'Accepted' }
            });
            const res = httpMocks.createResponse();

            const mockApp = {
                status: 'In Progress',
                jobId: id,
                userId: 'user123',
                save: jest.fn()
            };
            const mockJob = { _id: id, title: 'Developer', vacancies: 1 };

            Application.findById.mockResolvedValue(mockApp);
            Job.findById.mockResolvedValue(mockJob);

            await updateApplicationStatus(req, res);

            expect(changeVacancyCount).toHaveBeenCalledWith(id, 'dec');
            expect(addNotification).toHaveBeenCalled();
            expect(mockApp.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
        });
    });

    describe('revokeApplication', () => {
        test('should return 400 for missing or invalid ID', async () => {
            const req = httpMocks.createRequest({ params: { application_id: 'bad' } });
            const res = httpMocks.createResponse();

            await revokeApplication(req, res);
            expect(res.statusCode).toBe(400);
        });

        test('should return 404 if application not found', async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({ params: { application_id: id } });
            const res = httpMocks.createResponse();

            Application.findById.mockResolvedValue(null);

            await revokeApplication(req, res);
            expect(res.statusCode).toBe(404);
        });

        test('should revoke accepted application and increase vacancy', async () => {
            const id = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({ params: { application_id: id } });
            const res = httpMocks.createResponse();

            Application.findById.mockResolvedValue({ _id: id, status: 'Accepted', jobId: 'job123' });
            Application.findByIdAndDelete.mockResolvedValue({ _id: id });

            await revokeApplication(req, res);

            expect(changeVacancyCount).toHaveBeenCalledWith('job123', 'inc');
            expect(changeApplicantCount).toHaveBeenCalledWith('job123', 'dec');
            expect(res.statusCode).toBe(200);
        });
    });
});
