/**
 * Formats a number into Bangladeshi Taka currency format
 */
export const formatCurrency = amount => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace('BDT', '৳');
};

/**
 * Formats a date string into a clean, readable format (e.g., 12 Oct, 2023)
 */
export const formatDate = dateString => {
  if (!dateString) return '...';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
