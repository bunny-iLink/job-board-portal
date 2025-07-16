import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';

import {
    getApplicationsDataForEmployerBasedOnStatus,
    getApplicationsDataForUserBasedOnStatus,
    getApplicationsByDomain
} from '../../controllers/chartsDataController.js';

jest.mock('../../models/applications.js', () => ({
    Application: {
        aggregate: jest.fn()
    }
}));

const { Application } = await import('../../models/applications.js');

describe('chartsDataController', () => {
    afterEach(() => jest.clearAllMocks());

    describe('getApplicationsDataForEmployerBasedOnStatus', () => {
        test('should return 400 if employer ID is missing', async () => {
            const req = httpMocks.createRequest({ params: {} });
            const res = httpMocks.createResponse();

            await getApplicationsDataForEmployerBasedOnStatus(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Employer ID is required' });
        });

        test('should return status counts with all keys', async () => {
            const employerId = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({ params: { userId: employerId } });
            const res = httpMocks.createResponse();

            Application.aggregate.mockResolvedValue([
                { _id: 'Applied', count: 2 },
                { _id: 'Accepted', count: 1 }
            ]);

            await getApplicationsDataForEmployerBasedOnStatus(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                Applied: 2,
                'In Progress': 0,
                Accepted: 1,
                Rejected: 0
            });
        });

        test('should return 500 on aggregation error', async () => {
            Application.aggregate.mockRejectedValue(new Error('DB failure'));
            const req = httpMocks.createRequest({ params: { userId: new mongoose.Types.ObjectId().toString() } });
            const res = httpMocks.createResponse();

            await getApplicationsDataForEmployerBasedOnStatus(req, res);
            expect(res.statusCode).toBe(500);
        });
    });

    describe('getApplicationsDataForUserBasedOnStatus', () => {
        test('should return 400 if user ID is missing', async () => {
            const req = httpMocks.createRequest({ params: {} });
            const res = httpMocks.createResponse();

            await getApplicationsDataForUserBasedOnStatus(req, res);
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'User ID is required' });
        });

        test('should return status counts for user', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({ params: { userId } });
            const res = httpMocks.createResponse();

            Application.aggregate.mockResolvedValue([
                { _id: 'Rejected', count: 3 }
            ]);

            await getApplicationsDataForUserBasedOnStatus(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                Applied: 0,
                'In Progress': 0,
                Accepted: 0,
                Rejected: 3
            });
        });

        test('should return 500 on error', async () => {
            Application.aggregate.mockRejectedValue(new Error('fail'));
            const req = httpMocks.createRequest({ params: { userId: new mongoose.Types.ObjectId().toString() } });
            const res = httpMocks.createResponse();

            await getApplicationsDataForUserBasedOnStatus(req, res);
            expect(res.statusCode).toBe(500);
        });
    });

    describe('getApplicationsByDomain', () => {
        test('should return domain counts', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const req = httpMocks.createRequest({ params: { userId } });
            const res = httpMocks.createResponse();

            Application.aggregate.mockResolvedValue([
                { domain: 'Tech', count: 5 },
                { domain: 'Marketing', count: 2 }
            ]);

            await getApplicationsByDomain(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual([
                { domain: 'Tech', count: 5 },
                { domain: 'Marketing', count: 2 }
            ]);
        });

        test('should return 500 on error', async () => {
            Application.aggregate.mockRejectedValue(new Error('err'));
            const req = httpMocks.createRequest({ params: { userId: new mongoose.Types.ObjectId().toString() } });
            const res = httpMocks.createResponse();

            await getApplicationsByDomain(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Server error' });
        });
    });
});
