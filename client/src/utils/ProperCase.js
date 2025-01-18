export default function properCase(val) {
  if (!val) return ''; // Handle null, undefined, or empty string
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}
