import mongoose from 'mongoose';
import { Application } from '../../models/applications.js';

describe('Application Model', () => {
    it('should fail validation without required fields', async () => {
        const app = new Application({});
        let err;
        try {
            await app.validate();
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
        expect(err.errors.userId).toBeDefined();
        expect(err.errors.jobId).toBeDefined();
        expect(err.errors.employer).toBeDefined();
        expect(err.errors.employerId).toBeDefined();
    });

    it('should save successfully with valid data', async () => {
        const validApp = new Application({
            userId: new mongoose.Types.ObjectId(),
            jobId: new mongoose.Types.ObjectId(),
            employer: 'OpenAI',
            employerId: new mongoose.Types.ObjectId(),
        });

        const saved = await validApp.save();
        expect(saved._id).toBeDefined();
        expect(saved.status).toBe('Applied');
        expect(saved.appliedAt).toBeInstanceOf(Date);
    });

    it('should default status to "Applied"', async () => {
        const app = new Application({
            userId: new mongoose.Types.ObjectId(),
            jobId: new mongoose.Types.ObjectId(),
            employer: 'Google',
            employerId: new mongoose.Types.ObjectId(),
        });

        const saved = await app.save();
        expect(saved.status).toBe('Applied');
    });

    it('should not accept invalid status values', async () => {
        const app = new Application({
            userId: new mongoose.Types.ObjectId(),
            jobId: new mongoose.Types.ObjectId(),
            employer: 'Microsoft',
            employerId: new mongoose.Types.ObjectId(),
            status: 'Pending', // ❌ invalid
        });

        let err;
        try {
            await app.validate();
        } catch (e) {
            err = e;
        }

        expect(err).toBeDefined();
        expect(err.errors.status).toBeDefined();
    });
});
