const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function getDateSuffix() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  return `${mm}${dd}${yy}`;
}

function getLogFilePath(jobName) {
  const fileName = `${jobName}_${getDateSuffix()}.txt`;
  const logsDir = path.join(__dirname, '..', 'logs');

  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  return path.join(logsDir, fileName);
}

function createLogger(jobName) {
  const logFilePath = getLogFilePath(jobName);

  return async function log(message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    await fsp.appendFile(logFilePath, line);
    // console.log(line.trim()); // Also log to console
  };
}

module.exports = { createLogger };
