import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Detects the appropriate API Base URL based on environment / platform.
 * - Web: http://localhost:8000/api
 * - Android Emulator: http://10.0.2.2:8000/api
 * - Physical Device (Expo Go / Dev Client): uses host machine IP from Expo hostUri or fallback IP
 */
const getBaseUrl = (): string => {
  // 1. If explicit environment override is provided
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }

  // 3. Android Emulator
  // Can check if running on Android with 10.0.2.2
  // Or extract IP from Expo hostUri
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000/api`;
    }
  }

  // 4. Default fallback (Local machine Wi-Fi IP for direct physical mobile connection)
  const LOCAL_MACHINE_IP = '192.168.1.24';
  if (Platform.OS === 'android') {
    // If not detected, could be emulator (10.0.2.2) or device (LOCAL_MACHINE_IP)
    return `http://${LOCAL_MACHINE_IP}:8000/api`;
  }

  return `http://${LOCAL_MACHINE_IP}:8000/api`;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT_MS: 10000,
  TOKEN_STORAGE_KEY: '@myfirstapp_token',
  USER_STORAGE_KEY: '@myfirstapp_user',
};
