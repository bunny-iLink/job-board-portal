import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

describe('Middleware: verifyToken & requireRole', () => {
    const mockUserPayload = { id: 'user123', role: 'admin' };

    const mockVerify = jest.fn();

    // Mock jsonwebtoken with custom verify behavior
    jest.unstable_mockModule('jsonwebtoken', () => ({
        default: {
            verify: mockVerify
        }
    }));

    let verifyToken, requireRole;

    beforeEach(async () => {
        const middleware = await import('../../middleware/authMiddleware.js');
        verifyToken = middleware.verifyToken;
        requireRole = middleware.requireRole;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('✅ verifyToken: should call next if token is valid', async () => {
        const req = httpMocks.createRequest({
            method: 'GET',
            headers: {
                authorization: 'Bearer valid.token'
            }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        mockVerify.mockReturnValue(mockUserPayload);

        await verifyToken(req, res, next);

        expect(mockVerify).toHaveBeenCalledWith('valid.token', expect.any(String));
        expect(req.user).toEqual(mockUserPayload);
        expect(next).toHaveBeenCalled();
    });

    test('❌ verifyToken: should respond 403 if no token', async () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await verifyToken(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toEqual({ message: 'Token missing' });
        expect(next).not.toHaveBeenCalled();
    });

    test('❌ verifyToken: should respond 401 on invalid token', async () => {
        const req = httpMocks.createRequest({
            headers: { authorization: 'Bearer invalid.token' }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        mockVerify.mockImplementation(() => {
            throw new Error('invalid signature');
        });

        await verifyToken(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('✅ requireRole: allows access to matching role', async () => {
        const req = httpMocks.createRequest();
        req.user = { role: 'admin' };
        const res = httpMocks.createResponse();
        const next = jest.fn();

        const middleware = requireRole('admin');
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('❌ requireRole: blocks access to mismatched role', async () => {
        const req = httpMocks.createRequest();
        req.user = { role: 'user' };
        const res = httpMocks.createResponse();
        const next = jest.fn();

        const middleware = requireRole('admin');
        await middleware(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toEqual({ message: 'Access denied' });
        expect(next).not.toHaveBeenCalled();
    });
});
