import fs from 'fs';
import { Texts } from '../types';

const TEXTS_FILE_PATH = './texts.json';

export function loadTexts(): Texts {
  if (!fs.existsSync(TEXTS_FILE_PATH)) {
    console.error('Error: The texts.json file was not found!');
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(TEXTS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as Texts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error while parsing texts.json:', errorMessage);
    process.exit(1);
  }
}

