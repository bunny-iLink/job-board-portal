import { Notification } from '../../models/notification.js';

describe('Notification Model', () => {
    it('should require userId and message fields', async () => {
        const notification = new Notification({});
        let error;

        try {
            await notification.validate();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.userId).toBeDefined();
        expect(error.errors.message).toBeDefined();
    });

    it('should default isRead to false and set createdAt', async () => {
        const notification = new Notification({
            userId: '1234567890abcdef',
            message: 'You have a new message.',
        });

        const saved = await notification.save();

        expect(saved._id).toBeDefined();
        expect(saved.isRead).toBe(false);
        expect(saved.createdAt).toBeInstanceOf(Date);
    });

    it('should save with all required fields', async () => {
        const notification = new Notification({
            userId: 'user123',
            message: 'Application accepted!',
            isRead: true,
        });

        const saved = await notification.save();

        expect(saved.userId).toBe('user123');
        expect(saved.message).toBe('Application accepted!');
        expect(saved.isRead).toBe(true);
    });
});
