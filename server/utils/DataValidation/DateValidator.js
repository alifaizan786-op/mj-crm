const dayjs = require('dayjs');

async function validateDate(inputDate) {
  if (!inputDate) return null; // Return null for empty or undefined dates

  const formats = [
    'MM-DD-YYYY',
    'YYYY-MM-DD',
    'DD-MM-YYYY',
    'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO 8601 format
  ];

  for (let format of formats) {
    if (dayjs(inputDate, format, true).isValid()) {
      return dayjs(inputDate, format).toDate(); // Return a JavaScript Date object
    }
  }

  return null; // Return null for invalid dates
}

module.exports = validateDate;
