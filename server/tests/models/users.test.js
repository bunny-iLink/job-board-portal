import { User } from '../../models/users.js';

describe('User Model', () => {
    it('should require name, email, and password', async () => {
        const user = new User({});
        let error;

        try {
            await user.validate();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
    });

    it('should default role to "user" and timestamps to current date', async () => {
        const user = new User({
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'securepass123',
        });

        const saved = await user.save();

        expect(saved.role).toBe('user');
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it('should save optional fields like preferredDomain and experience', async () => {
        const user = new User({
            name: 'Sam Smith',
            email: 'sam@example.com',
            password: 'pass1234',
            preferredDomain: 'Backend',
            experience: 2,
            address: '123 Dev Street',
            phone: '1234567890',
            profilePicture: {
                data: 'base64encodedimage',
                contentType: 'image/png',
            },
            resume: {
                data: 'base64encodedpdf',
                contentType: 'application/pdf',
            },
        });

        const saved = await user.save();

        expect(saved.preferredDomain).toBe('Backend');
        expect(saved.experience).toBe(2);
        expect(saved.address).toBe('123 Dev Street');
        expect(saved.phone).toBe('1234567890');
        expect(saved.profilePicture.contentType).toBe('image/png');
        expect(saved.resume.contentType).toBe('application/pdf');
    });
});
