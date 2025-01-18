export default function formatPhoneNumber(phoneNumber) {
  if (!/^\d{10}$/.test(phoneNumber)) {
    return phoneNumber;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6)}`;
}
