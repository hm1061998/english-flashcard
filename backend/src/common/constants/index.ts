export const APP_CONSTANTS = {
  API_PREFIX: 'api',
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key',
    EXPIRES_IN: '1d',
  },
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
};

export const RESPONSE_MESSAGES = {
  SUCCESS: 'Success',
  ERROR: 'Internal Server Error',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
};
