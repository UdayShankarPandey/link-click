import User from '../models/User.js';

describe('User Model Email Validation', () => {
  const validEmails = [
    'user@domain.com',
    'user.name+tag@sub.domain.org',
    'a@b.co',
    'user@domain.co.uk',
  ];

  const invalidEmails = [
    'plainaddress',
    '@domain.com',
    'user@domain',
    'user@domain..com',
    'user@@domain.com',
  ];

  validEmails.forEach((email) => {
    it(`should accept valid email: ${email}`, () => {
      const user = new User({
        name: 'Test User',
        email,
        password: 'password123',
      });
      const err = user.validateSync();
      expect(err?.errors?.email).toBeUndefined();
    });
  });

  invalidEmails.forEach((email) => {
    it(`should reject invalid email: ${email}`, () => {
      const user = new User({
        name: 'Test User',
        email,
        password: 'password123',
      });
      const err = user.validateSync();
      expect(err?.errors?.email).toBeDefined();
    });
  });
});
