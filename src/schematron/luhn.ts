/**
 * Luhn (mod-10) check.
 *
 * Used for Swedish organisationsnummer and the last 10 digits of
 * personnummer. Accepts a digit-only string and returns true if the
 * sum of doubled-every-other digits is divisible by 10.
 */
export function luhn(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}
