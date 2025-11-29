import admin from 'firebase-admin';
import { config } from '../config/env';

const serviceAccount = require(config.firebase.serviceAccountKeyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();

