import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

jest.mock('../../models/notification.js', () => ({
    Notification: {
        find: jest.fn(),
        countDocuments: jest.fn(),
        deleteMany: jest.fn(),
        prototype: {
            save: jest.fn(),
        },
    },
}));

const { Notification } = await import('../../models/notification.js');
const {
    addNotification,
    getUserNotifications,
    clearNotifications,
} = await import('../../controllers/notificationsController.js');

describe('notificationsController', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('addNotification', () => {
        test('✅ should create and save a notification', async () => {
            const saveMock = jest.fn().mockResolvedValue({});
            Notification.mockImplementation = jest.fn(() => ({ save: saveMock }));

            const userId = new mongoose.Types.ObjectId().toString();
            const message = 'New notification';

            await addNotification(userId, message);

            expect(saveMock).toHaveBeenCalled();
        });

        test('❌ should log error if save fails', async () => {
            const error = new Error('DB error');
            const saveMock = jest.fn().mockRejectedValue(error);
            Notification.mockImplementation = jest.fn(() => ({ save: saveMock }));

            const userId = new mongoose.Types.ObjectId().toString();
            const message = 'Failing notification';

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await addNotification(userId, message);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to send notification'),
                error
            );
        });
    });

    describe('getUserNotifications', () => {
        const mockUserId = new mongoose.Types.ObjectId().toString();

        test('✅ should return notifications with pagination', async () => {
            const notifications = [{ message: 'Hello' }, { message: 'World' }];
            Notification.find.mockReturnValue({
                sort: () => ({
                    skip: () => ({
                        limit: () => ({
                            lean: () => Promise.resolve(notifications),
                        }),
                    }),
                }),
            });
            Notification.countDocuments.mockResolvedValue(10);

            const req = httpMocks.createRequest({
                method: 'GET',
                params: { userId: mockUserId },
                query: { page: 1 },
            });
            const res = httpMocks.createResponse();

            await getUserNotifications(req, res);

            const data = res._getJSONData();
            expect(res.statusCode).toBe(200);
            expect(data.notifications).toEqual(notifications);
            expect(data.pagination).toEqual({
                total: 10,
                page: 1,
                totalPages: 2,
            });
        });

        test('❌ should return 400 for invalid ObjectId', async () => {
            const req = httpMocks.createRequest({
                method: 'GET',
                params: { userId: 'invalid-id' },
            });
            const res = httpMocks.createResponse();

            await getUserNotifications(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Invalid user ID.' });
        });

        test('❌ should return 500 on error', async () => {
            Notification.find.mockImplementation(() => {
                throw new Error('DB error');
            });

            const req = httpMocks.createRequest({
                method: 'GET',
                params: { userId: mockUserId },
            });
            const res = httpMocks.createResponse();

            await getUserNotifications(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Internal server error.' });
        });
    });

    describe('clearNotifications', () => {
        const mockUserId = new mongoose.Types.ObjectId().toString();

        test('✅ should clear notifications for valid user', async () => {
            Notification.deleteMany.mockResolvedValue({ deletedCount: 3 });

            const req = httpMocks.createRequest({
                method: 'DELETE',
                params: { userId: mockUserId },
            });
            const res = httpMocks.createResponse();

            await clearNotifications(req, res);

            expect(Notification.deleteMany).toHaveBeenCalledWith({ userId: mockUserId });
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: 'Notifications cleared successfully.',
            });
        });

        test('❌ should return 400 for invalid userId', async () => {
            const req = httpMocks.createRequest({
                method: 'DELETE',
                params: { userId: 'invalid' },
            });
            const res = httpMocks.createResponse();

            await clearNotifications(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Invalid user ID.' });
        });

        test('❌ should handle errors in deletion', async () => {
            Notification.deleteMany.mockRejectedValue(new Error('DB failure'));

            const req = httpMocks.createRequest({
                method: 'DELETE',
                params: { userId: mockUserId },
            });
            const res = httpMocks.createResponse();

            await clearNotifications(req, res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Internal server error.' });
        });
    });
});
