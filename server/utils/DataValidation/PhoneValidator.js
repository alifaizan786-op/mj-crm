// Utility to normalize phone numbers
function ValidatePhone(phone) {
  if (!phone) return null;
  const normalized = phone.replace(/[\s()-]/g, '');
  return normalized.length >= 10 ? normalized : null; // Ensure the phone number is valid
}

module.exports = ValidatePhone;
