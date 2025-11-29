import { db } from './firebase.service';
import { User, UserData } from '../types';

const usersCollection = db.collection('users');

/**
 * Saving a new user in Firestore.
 */
export async function saveUser(user: UserData): Promise<void> {
  try {
    const docRef = await usersCollection.add(user);
    console.log('Пользователь добавлен с ID:', docRef.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ошибка при добавлении пользователя:', errorMessage);
    throw error;
  }
}

/**
 * Downloading all users from Firestore.
 */
export async function loadUsers(): Promise<User[]> {
  try {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ошибка при загрузке пользователей:', errorMessage);
    return [];
  }
}

/**
 * Deleting a user by docId.
 */
export async function deleteUser(docId: string): Promise<void> {
  try {
    await usersCollection.doc(docId).delete();
    console.log('Пользователь удален:', docId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ошибка при удалении пользователя:', errorMessage);
    throw error;
  }
}

