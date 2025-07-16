import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import express from 'express';
import router from '../../router/router.js';

// Mock controllers
jest.unstable_mockModule('../../controllers/userController.js', () => ({
    addUser: jest.fn((req, res) => res.status(201).json({ message: 'User added' })),
    getUserData: jest.fn((req, res) => res.status(200).json({ userId: req.params.userId })),
    updateUserData: jest.fn((req, res) => res.status(200).json({ message: 'User updated' })),
    deleteUserData: jest.fn((req, res) => res.status(204).end()),
}));

jest.unstable_mockModule('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 'mockUserId', role: 'user' }; // or 'employer' as needed
        next();
    },
    requireRole: (role) => (req, res, next) => {
        if (req.user.role === role) return next();
        return res.status(403).json({ message: 'Access denied' });
    }
}));

let app;
beforeEach(async () => {
    app = express();
    app.use(express.json());

    const mockRouter = (await import('../../router/router.js')).default;
    app.use('/', mockRouter);
});

// ✅ POST
test('POST /addUser should call addUser controller', async () => {
    const req = httpMocks.createRequest({
        method: 'POST',
        url: '/addUser',
        body: { name: 'John Doe' }
    });
    const res = httpMocks.createResponse();

    await app.handle(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({ message: 'User added' });
});

// ✅ GET
test('GET /getUserData/:userId should call getUserData controller', async () => {
    const req = httpMocks.createRequest({
        method: 'GET',
        url: '/getUserData/user123',
        params: { userId: 'user123' }
    });
    const res = httpMocks.createResponse();

    await app.handle(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ userId: 'user123' });
});

// ✅ PUT
test('PUT /updateUser/:userId should call updateUserData controller', async () => {
    const req = httpMocks.createRequest({
        method: 'PUT',
        url: '/updateUser/user123',
        params: { userId: 'user123' },
        body: { name: 'Jane Doe' },
        headers: { authorization: 'Bearer test.token' }
    });
    const res = httpMocks.createResponse();

    await app.handle(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'User updated' });
});

// ✅ DELETE
test('DELETE /deleteUser/:userId should call deleteUserData controller', async () => {
    const req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/deleteUser/user123',
        params: { userId: 'user123' },
        headers: { authorization: 'Bearer test.token' }
    });
    const res = httpMocks.createResponse();

    await app.handle(req, res);

    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBe(true);
});
