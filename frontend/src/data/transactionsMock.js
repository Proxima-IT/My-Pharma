/**
 * Mock data for Transaction History
 */
export const mockTransactions = [
  {
    id: 1,
    order_id: '3950',
    created_at: '2026-01-03T10:30:00Z',
    txn_id: 'BKASH-78234190',
    payment_method: 'BKASH',
    status: 'COMPLETED',
    amount: 2930.0,
  },
  {
    id: 2,
    order_id: '10232',
    created_at: '2026-02-14T14:20:00Z',
    txn_id: 'COD-99283112',
    payment_method: 'CASH_ON_DELIVERY',
    status: 'PENDING',
    amount: 550.5,
  },
  {
    id: 3,
    order_id: '10233',
    created_at: '2026-02-15T09:15:00Z',
    txn_id: 'NAGAD-11203944',
    payment_method: 'NAGAD',
    status: 'FAILED',
    amount: 2100.0,
  },
  {
    id: 4,
    order_id: '10234',
    created_at: '2026-02-16T11:45:00Z',
    txn_id: 'ROCKET-55627182',
    payment_method: 'ROCKET',
    status: 'COMPLETED',
    amount: 890.0,
  },
];
