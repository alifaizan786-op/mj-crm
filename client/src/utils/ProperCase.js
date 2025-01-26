export default function ProperCase(name) {
  if (!name || typeof name !== 'string') {
    return ''; // Return an empty string or a default value if input is invalid
  }

  // Replace "/" with "&", then capitalize each part of the name
  return name
    .replace(/\//g, ' & ') // Replace "/" with " & "
    .toLowerCase() // Convert to lowercase
    .split(' ') // Split into parts by space
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join parts back together
}
