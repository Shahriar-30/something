export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const ROUTES = {
  HOME: '/',
  CONTACTS: '/contacts',
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'CRM Application',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
