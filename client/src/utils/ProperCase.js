export default function ProperCase(name) {
  // Replace "/" with "&", then capitalize each part of the name
  return name
    .replace(/\//g, ' & ') // Replace "/" with " & "
    .toLowerCase() // Convert to lowercase
    .split(' ') // Split into parts by space
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join parts back together
}
