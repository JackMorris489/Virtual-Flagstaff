export default function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");

  // must be 10 digits
  if (digits.length != 10) return false;

  // reject numbers like 0000000000 or 1111111111
  if (/^(\d)\1+$/.test(digits)) return false;

  return true;
}