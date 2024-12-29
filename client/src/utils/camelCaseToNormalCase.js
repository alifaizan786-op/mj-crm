export default function CamelCaseToNormalCase(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}
