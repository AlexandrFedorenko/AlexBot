const db = require('../firebase-config');

const usersCollection = db.collection('users');

/**
 * Saving a new user in Firestore.
 * @param {Object} user - A user object with data.
 */
async function saveUser(user) {
  try {
    const docRef = await usersCollection.add(user);
    console.log('Пользователь добавлен с ID:', docRef.id);
  } catch (error) {
    console.error('Ошибка при добавлении пользователя:', error.message);
  }
}

/**
 * Downloading all users from Firestore.
 * @returns {Array} - Array of users.
 */
async function loadUsers() {
  try {
    const snapshot = await usersCollection.get();
    const users = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error.message);
    return [];
  }
}

/**
 * Deleting a user by docId.
 * @param {string} docId - Document ID (doc.id) to be deleted
 */
async function deleteUser(docId) {
  try {
    await usersCollection.doc(docId).delete();
    console.log('Пользователь удален:', docId);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error.message);
  }
}

module.exports = { saveUser, loadUsers, deleteUser };
