import admin from 'firebase-admin';
import { config } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Firebase Admin SDK initialization service
 * 
 * This service supports two methods of providing Firebase credentials:
 * 1. Environment variable (FIREBASE_SERVICE_ACCOUNT_KEY) - for production deployments (Coolify, Docker, etc.)
 *    - Stores the entire JSON key as a multiline environment variable
 *    - More secure for cloud deployments where file management is complex
 * 2. File path (FIREBASE_SERVICE_ACCOUNT_KEY_PATH) - for local development
 *    - Points to a local JSON file with Firebase credentials
 *    - Easier to manage during development
 * 
 * Priority: Environment variable takes precedence over file path
 */
let serviceAccount: any;

// Check if credentials are provided via environment variable (production/deployment)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Parse JSON from environment variable
  // This is the preferred method for cloud deployments (Coolify, Render, etc.)
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else if (config.firebase.serviceAccountKeyPath) {
  // Fallback to file-based credentials (local development)
  const keyPath = path.resolve(config.firebase.serviceAccountKeyPath);
  if (fs.existsSync(keyPath)) {
    serviceAccount = require(keyPath);
  } else {
    throw new Error(`Firebase service account key file not found at: ${keyPath}`);
  }
} else {
  throw new Error(
    'Firebase service account key not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_KEY_PATH'
  );
}

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export Firestore database instance for use throughout the application
export const db = admin.firestore();

