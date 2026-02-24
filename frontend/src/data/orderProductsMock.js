/**
 * Mock data to supplement missing fields from the Order Items API
 * Keyed by product ID
 */
export const orderProductsMock = {
  // Example mapping for product ID 1
  1: {
    image:
      'https://acme.com.bd/wp-content/uploads/2018/12/A-Fenac-50-Tablet.png',
    generic_name: 'Diclofenac Sodium BP 50mg',
    dosage: '50mg',
    unit_label: '20 Tablets (2 Strip)',
    slug: 'a-fenac-50',
  },
  // Example mapping for product ID 2
  2: {
    image: 'https://www.squarepharma.com.bd/products/Monalast-10.png',
    generic_name: 'Montelukast Sodium 10mg',
    dosage: '10mg',
    unit_label: '10 Tablets (1 Strip)',
    slug: 'monalast-10',
  },
  // Add more mappings as needed based on your database product IDs
};

export const getProductMetadata = productId => {
  return (
    orderProductsMock[productId] || {
      image: null,
      generic_name: 'Generic Information N/A',
      dosage: 'N/A',
      unit_label: 'Quantity N/A',
      slug: '#',
    }
  );
};
