export default function properCase(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
