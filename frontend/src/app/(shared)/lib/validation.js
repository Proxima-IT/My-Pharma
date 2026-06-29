/**
 * Validates Bangladeshi phone numbers.
 * Allowed formats:
 * - 01XXXXXXXXX (11 digits, starts with 01)
 * - 8801XXXXXXXXX (13 digits, starts with 8801)
 * - +8801XXXXXXXXX (starts with +8801, parsed as 13 digits)
 * - 1XXXXXXXXX (10 digits starting with 1, e.g. 1712345678, which is accepted by backend normalize_phone)
 *
 * The third digit (or digit immediately following the prefix) must be a valid BD operator prefix (1 or 3-9).
 * E.g., 3 (GP), 4 (Banglalink), 5 (Teletalk), 6 (Airtel), 7 (GP), 8 (Robi), 9 (Banglalink), 1 (Citycell).
 *
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidBDPhone = (phone) => {
  if (!phone) return false;

  // Strip any non-digit characters
  const digits = phone.replace(/\D/g, '');

  // 1. 10 digits format (starts with 1, e.g. 1712345678)
  if (digits.length === 10 && digits.startsWith('1')) {
    return /^1[13-9]\d{8}$/.test(digits);
  }

  // 2. 11 digits format (starts with 01, e.g. 01712345678)
  if (digits.length === 11 && digits.startsWith('01')) {
    return /^01[13-9]\d{8}$/.test(digits);
  }

  // 3. 13 digits format (starts with 8801, e.g. 8801712345678)
  if (digits.length === 13 && digits.startsWith('8801')) {
    return /^8801[13-9]\d{8}$/.test(digits);
  }

  return false;
};
