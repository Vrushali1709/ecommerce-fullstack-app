import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Production Live Backend URL deployed on Render
 */
export const PRODUCTION_API_URL = 'https://ecommerce-fullstack-app-sop2.onrender.com/api';

/**
 * Detects the appropriate API Base URL based on environment / platform.
 * 1. Explicit EXPO_PUBLIC_API_URL from .env
 * 2. Production URL as default for standalone / APK / web / mobile
 */
const getBaseUrl = (): string => {
  // 1. If explicit environment override is provided
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Production Default (Render Live Backend)
  return PRODUCTION_API_URL;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT_MS: 30000, // 30s timeout to handle free cloud cold starts
  TOKEN_STORAGE_KEY: '@myfirstapp_token',
  USER_STORAGE_KEY: '@myfirstapp_user',
};

