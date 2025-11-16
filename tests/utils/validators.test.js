/**
 * Тесты для валидаторов
 */

const {
  isValidEmail,
  validateTour,
  validateApplication,
  validateSubscription,
  validateAuth
} = require('../../server/utils/validators');
const { ValidationError } = require('../../server/utils/errors');

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });
});

describe('validateTour', () => {
  it('should throw error for missing title', () => {
    expect(() => {
      validateTour({});
    }).toThrow(ValidationError);
  });

  it('should throw error for invalid price', () => {
    expect(() => {
      validateTour({ title: 'Test', price: -100 });
    }).toThrow(ValidationError);
  });

  it('should throw error for invalid date range', () => {
    expect(() => {
      validateTour({
        title: 'Test',
        date_start: '2024-12-31',
        date_end: '2024-01-01'
      });
    }).toThrow(ValidationError);
  });

  it('should pass for valid tour data', () => {
    expect(() => {
      validateTour({
        title: 'Test Tour',
        price: 1000,
        date_start: '2024-01-01',
        date_end: '2024-01-10'
      });
    }).not.toThrow();
  });
});

describe('validateApplication', () => {
  it('should throw error for missing name', () => {
    expect(() => {
      validateApplication({ phone: '1234567890' });
    }).toThrow(ValidationError);
  });

  it('should throw error for missing phone', () => {
    expect(() => {
      validateApplication({ name: 'Test User' });
    }).toThrow(ValidationError);
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      validateApplication({
        name: 'Test',
        phone: '1234567890',
        email: 'invalid-email'
      });
    }).toThrow(ValidationError);
  });
});

describe('validateSubscription', () => {
  it('should throw error for missing email', () => {
    expect(() => {
      validateSubscription({});
    }).toThrow(ValidationError);
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      validateSubscription({ email: 'invalid' });
    }).toThrow(ValidationError);
  });
});

describe('validateAuth', () => {
  it('should throw error for missing username', () => {
    expect(() => {
      validateAuth({ password: 'password' });
    }).toThrow(ValidationError);
  });

  it('should throw error for missing password', () => {
    expect(() => {
      validateAuth({ username: 'admin' });
    }).toThrow(ValidationError);
  });
});

