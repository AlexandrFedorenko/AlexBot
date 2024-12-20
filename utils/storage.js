const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const RECIPIENTS_FILE = 'recipients.json.enc';
const algorithm = 'aes-256-ctr';
const secretKey = process.env.SECRET_KEY;
if (!secretKey) {
  console.error('SECRET_KEY is not defined in .env file.');
  process.exit(1);
}

function encrypt(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
}

function decrypt(hash) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString());
}

// Encrypt and save the file
function encryptFile(inputFile, outputFile) {
  try {
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    const encryptedData = encrypt(data);
    fs.writeFileSync(outputFile, JSON.stringify(encryptedData, null, 2));
    console.log(`File encrypted and saved to ${outputFile}`);
  } catch (error) {
    console.error('Error while encrypting file:', error.message);
  }
}

// Decrypt the file
function decryptFile(inputFile) {
  try {
    const encryptedData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    return decrypt(encryptedData);
  } catch (error) {
    console.error('Error while decrypting file:', error.message);
    return [];
  }
}

function loadRecipients() {
  if (fs.existsSync(RECIPIENTS_FILE)) {
    try {
      const data = decryptFile(RECIPIENTS_FILE);
      // Filter records with correct id
      return data.filter(user => typeof user.id === 'number' && user.id > 0);
    } catch (error) {
      console.error('Error while parsing or decrypting recipients.json.enc:', error.message);
      return [];
    }
  }
  return [];
}

function saveRecipients(recipients) {
  try {
    const encryptedData = encrypt(recipients);
    fs.writeFileSync(RECIPIENTS_FILE, JSON.stringify(encryptedData, null, 2));
  } catch (error) {
    console.error('Error while encrypting or saving recipients.json.enc:', error.message);
  }
}

module.exports = { loadRecipients, saveRecipients, encryptFile, decryptFile };
