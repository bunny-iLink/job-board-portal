import httpMocks from 'node-mocks-http';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

jest.mock('../../models/users.js', () => ({
    User: {
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        prototype: {
            save: jest.fn(),
        },
    },
}));

jest.mock('../../models/employer.js', () => ({
    Employer: {
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        prototype: {
            save: jest.fn(),
        },
    },
}));

jest.mock('../../models/notification.js', () => ({
    Notification: {
        deleteMany: jest.fn(),
    },
}));

jest.mock('../../models/applications.js', () => ({
    Application: {
        deleteMany: jest.fn(),
    },
}));

jest.mock('../../models/jobs.js', () => ({
    Job: {
        deleteMany: jest.fn(),
    },
}));

import { User } from '../../models/users.js';
import { Employer } from '../../models/employer.js';
import { Application } from '../../models/applications.js';
import { Notification } from '../../models/notification.js';
import { Job } from '../../models/jobs.js';

import {
    addUser,
    addEmployer,
    getUserData,
    getEmployerData,
    updateUserData,
    updateEmployerData,
    deleteUserData,
    deleteEmployerData,
} from '../../controllers/userEmployerController.js';

describe('User & Employer Controller', () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockEmployerId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addUser', () => {
        it('should add a new user', async () => {
            User.findOne.mockResolvedValue(null);
            Employer.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue({
                toObject: () => ({ _id: mockUserId, name: 'Test', email: 'test@mail.com' }),
            });

            const req = httpMocks.createRequest({
                body: {
                    name: 'Test',
                    email: 'test@mail.com',
                    password: 'secret',
                },
            });
            const res = httpMocks.createResponse();

            await addUser(req, res);
            expect(res.statusCode).toBe(201);
        });

        it('should not allow duplicate email', async () => {
            User.findOne.mockResolvedValue({});

            const req = httpMocks.createRequest({
                body: {
                    name: 'Test',
                    email: 'duplicate@mail.com',
                    password: 'secret',
                },
            });
            const res = httpMocks.createResponse();

            await addUser(req, res);
            expect(res.statusCode).toBe(409);
        });
    });

    describe('getUserData', () => {
        it('should return user data if found', async () => {
            User.findById.mockResolvedValue({
                toObject: () => ({ _id: mockUserId, name: 'Test User', email: 'test@mail.com' }),
            });

            const req = httpMocks.createRequest({
                params: { userId: mockUserId },
            });
            const res = httpMocks.createResponse();

            await getUserData(req, res);
            expect(res.statusCode).toBe(200);
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);
            const req = httpMocks.createRequest({ params: { userId: mockUserId } });
            const res = httpMocks.createResponse();

            await getUserData(req, res);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('updateUserData', () => {
        it('should update user and return updated data', async () => {
            User.findByIdAndUpdate.mockResolvedValue({
                toObject: () => ({ _id: mockUserId, name: 'Updated' }),
            });

            const req = httpMocks.createRequest({
                params: { userId: mockUserId },
                body: { name: 'Updated' },
            });
            const res = httpMocks.createResponse();

            await updateUserData(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('deleteUserData', () => {
        it('should delete user and related data', async () => {
            Application.deleteMany.mockResolvedValue({ deletedCount: 2 });
            Notification.deleteMany.mockResolvedValue({ deletedCount: 3 });
            User.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const req = httpMocks.createRequest({
                params: { userId: mockUserId },
            });
            const res = httpMocks.createResponse();

            await deleteUserData(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('addEmployer', () => {
        it('should add a new employer', async () => {
            Employer.findOne.mockResolvedValue(null);
            User.findOne.mockResolvedValue(null);
            Employer.prototype.save = jest.fn().mockResolvedValue({
                toObject: () => ({ _id: mockEmployerId, email: 'emp@mail.com' }),
            });

            const req = httpMocks.createRequest({
                body: {
                    name: 'Employer',
                    email: 'emp@mail.com',
                    password: 'emp123',
                    company: 'TestCorp',
                },
            });
            const res = httpMocks.createResponse();

            await addEmployer(req, res);
            expect(res.statusCode).toBe(201);
        });
    });

    describe('getEmployerData', () => {
        it('should return employer data if found', async () => {
            Employer.findById.mockResolvedValue({
                toObject: () => ({ _id: mockEmployerId, name: 'Employer' }),
            });

            const req = httpMocks.createRequest({
                params: { employerId: mockEmployerId },
            });
            const res = httpMocks.createResponse();

            await getEmployerData(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('updateEmployerData', () => {
        it('should update employer', async () => {
            Employer.findByIdAndUpdate.mockResolvedValue({
                toObject: () => ({ _id: mockEmployerId, name: 'Updated Emp' }),
            });

            const req = httpMocks.createRequest({
                params: { employerId: mockEmployerId },
                body: { name: 'Updated Emp' },
            });
            const res = httpMocks.createResponse();

            await updateEmployerData(req, res);
            expect(res.statusCode).toBe(200);
        });
    });

    describe('deleteEmployerData', () => {
        it('should delete employer and related jobs', async () => {
            Job.deleteMany.mockResolvedValue({ deletedCount: 2 });
            Employer.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const req = httpMocks.createRequest({
                params: { employerId: mockEmployerId },
            });
            const res = httpMocks.createResponse();

            await deleteEmployerData(req, res);
            expect(res.statusCode).toBe(200);
        });
    });
});
