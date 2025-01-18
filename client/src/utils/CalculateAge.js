export default function CalculateAge(birthDate) {
  // Ensure the input is a valid date
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) {
    return { error: 'Invalid Date' };
  }

  // Get the current date
  const today = new Date();

  // Calculate years
  let years = today.getFullYear() - birth.getFullYear();

  // Calculate months
  let months = today.getMonth() - birth.getMonth();

  // Adjust if the birthday hasn't occurred yet this year
  if (
    months < 0 ||
    (months === 0 && today.getDate() < birth.getDate())
  ) {
    years--;
    months += 12;
  }

  // Adjust days if the current day is before the birth day
  if (today.getDate() < birth.getDate()) {
    months--;
  }

  return { years, months };
}
