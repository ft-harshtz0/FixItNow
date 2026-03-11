import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Safely read JSON file
 * @param {string} filename - Name of the JSON file
 * @returns {Promise<any>} Parsed JSON data
 */
export async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return appropriate default
      if (filename === 'chats.json') return {};
      return [];
    }
    throw error;
  }
}

/**
 * Safely write JSON file (atomic operation)
 * @param {string} filename - Name of the JSON file
 * @param {any} data - Data to write
 */
export async function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const tempPath = `${filePath}.tmp`;
    
    // Write to temp file first
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    
    // Rename temp file to actual file (atomic operation)
    await fs.rename(tempPath, filePath);
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    throw error;
  }
}

/**
 * Initialize storage - create data directory and files if they don't exist
 */
export async function initializeStorage() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/job-images');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Initialize data files if they don't exist
    const files = {
      'users.json': [],
      'jobs.json': [],
      'chats.json': {},
      'ratings.json': []
    };
    
    for (const [filename, defaultData] of Object.entries(files)) {
      const filePath = path.join(DATA_DIR, filename);
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        console.log(`Created ${filename}`);
      }
    }
    
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}
