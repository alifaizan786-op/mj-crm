const parseDBF = require('parsedbf');
const fs = require('fs');

// Function to read and parse a DBF file
async function DBFReader(filePath) {
  console.time(`Reading DBF file: ${filePath}`);
  try {
    const dbfFile = fs.readFileSync(filePath); // Read the DBF file
    const parsedDBF = parseDBF(dbfFile); // Parse the DBF file
    console.timeEnd(`Reading DBF file: ${filePath}`);
    return parsedDBF;
  } catch (error) {
    console.error(`Error reading DBF file at ${filePath}:`, error);
    throw error;
  }
}

module.exports = DBFReader;
