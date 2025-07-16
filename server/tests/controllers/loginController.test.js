import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import * as loginController from '../../controllers/loginController.js';

jest.mock('../../models/users.js', () => ({
    User: { findOne: jest.fn() }
}));

jest.mock('../../models/employer.js', () => ({
    Employer: { findOne: jest.fn() }
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const { User } = await import('../../models/users.js');
const { Employer } = await import('../../models/employer.js');

describe('Login Controller', () => {
    afterEach(() => jest.clearAllMocks());

    describe('loginUser', () => {
        test('should return 400 if email or password missing', async () => {
            const req = httpMocks.createRequest({ body: {} });
            const res = httpMocks.createResponse();

            await loginController.loginUser(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Email and password are required' });
        });

        test('should return 404 if no account found', async () => {
            User.findOne.mockResolvedValue(null);
            Employer.findOne.mockResolvedValue(null);

            const req = httpMocks.createRequest({
                body: { email: 'test@example.com', password: '123' }
            });
            const res = httpMocks.createResponse();

            await loginController.loginUser(req, res);

            expect(res.statusCode).toBe(404);
        });

        test('should return 401 for incorrect password', async () => {
            const mockUser = { _id: 'user123', email: 'user@example.com', password: 'hashed' };
            User.findOne.mockResolvedValue(mockUser);
            Employer.findOne.mockResolvedValue(null);
            bcrypt.compare.mockResolvedValue(false);

            const req = httpMocks.createRequest({
                body: { email: 'user@example.com', password: 'wrongpass' }
            });
            const res = httpMocks.createResponse();

            await loginController.loginUser(req, res);

            expect(res.statusCode).toBe(401);
        });

        test('should return 200 with tokens for valid user', async () => {
            const mockUser = {
                _id: 'user123',
                email: 'user@example.com',
                password: 'hashed',
                name: 'Test User'
            };

            User.findOne.mockResolvedValue(mockUser);
            Employer.findOne.mockResolvedValue(null);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockImplementation((payload) => `token-for-${payload.email}`);

            const req = httpMocks.createRequest({
                body: { email: 'user@example.com', password: 'validpass' }
            });
            const res = httpMocks.createResponse();

            await loginController.loginUser(req, res);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data).toMatchObject({
                message: 'Login successful',
                token: 'token-for-user@example.com',
                refresh_token: 'token-for-user@example.com',
                user: {
                    _id: 'user123',
                    email: 'user@example.com',
                    role: 'user',
                    name: 'Test User'
                }
            });
        });

        test('should return 200 with tokens for valid employer', async () => {
            const mockEmployer = {
                _id: 'emp123',
                email: 'employer@example.com',
                password: 'hashed',
                name: 'Employer Inc'
            };

            User.findOne.mockResolvedValue(null);
            Employer.findOne.mockResolvedValue(mockEmployer);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockImplementation((payload) => `token-for-${payload.email}`);

            const req = httpMocks.createRequest({
                body: { email: 'employer@example.com', password: 'validpass' }
            });
            const res = httpMocks.createResponse();

            await loginController.loginUser(req, res);

            expect(res.statusCode).toBe(200);
            const data = res._getJSONData();
            expect(data.user.role).toBe('employer');
        });
    });

    describe('refreshAccessToken', () => {
        test('should return 401 if refresh token missing', async () => {
            const req = httpMocks.createRequest({ body: {} });
            const res = httpMocks.createResponse();

            await loginController.refreshAccessToken(req, res);
            expect(res.statusCode).toBe(401);
        });

        test('should return 403 if token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const req = httpMocks.createRequest({ body: { refreshToken: 'bad.token' } });
            const res = httpMocks.createResponse();

            await loginController.refreshAccessToken(req, res);
            expect(res.statusCode).toBe(403);
            expect(res._getJSONData()).toEqual({ message: 'Invalid or expired refresh token' });
        });

        test('should return 200 with new access token on valid refresh', async () => {
            const payload = { id: 'u1', email: 'user@example.com', role: 'user' };
            jwt.verify.mockReturnValue(payload);
            jwt.sign.mockReturnValue('new.access.token');

            const req = httpMocks.createRequest({ body: { refreshToken: 'good.token' } });
            const res = httpMocks.createResponse();

            await loginController.refreshAccessToken(req, res);
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                accessToken: 'new.access.token',
                message: 'Access token refreshed'
            });
        });
    });
});
