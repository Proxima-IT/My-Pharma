/**
 * Validates if the address string is substantial enough for delivery
 */
export const isValidAddress = address => {
  return address && address.trim().length > 10;
};
