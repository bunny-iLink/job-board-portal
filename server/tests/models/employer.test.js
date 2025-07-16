import mongoose from 'mongoose';
import { Employer } from '../../models/employer.js';

describe('Employer Model', () => {
    it('should fail validation if required fields are missing', async () => {
        const employer = new Employer({});
        let err;

        try {
            await employer.validate();
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
        expect(err.errors.name).toBeDefined();
        expect(err.errors.email).toBeDefined();
    });

    it('should save successfully with valid required fields', async () => {
        const employer = new Employer({
            name: 'Jane Doe',
            email: 'jane@company.com',
        });

        const saved = await employer.save();
        expect(saved._id).toBeDefined();
        expect(saved.name).toBe('Jane Doe');
        expect(saved.email).toBe('jane@company.com');
        expect(saved.role).toBe('employer');
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it('should store optional fields correctly', async () => {
        const employer = new Employer({
            name: 'John Smith',
            email: 'john@company.com',
            experience: 10,
            designation: 'CTO',
            domain: 'AI',
            profilePicture: {
                data: 'base64string',
                contentType: 'image/png',
            },
        });

        const saved = await employer.save();
        expect(saved.experience).toBe(10);
        expect(saved.designation).toBe('CTO');
        expect(saved.domain).toBe('AI');
        expect(saved.profilePicture.data).toBe('base64string');
        expect(saved.profilePicture.contentType).toBe('image/png');
    });

    it('should default role to "employer"', async () => {
        const employer = new Employer({
            name: 'Alice',
            email: 'alice@startup.io',
        });

        const saved = await employer.save();
        expect(saved.role).toBe('employer');
    });
});
