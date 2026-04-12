import {
  NOTIFICATION_ENDPOINTS,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

export const broadcastNotificationApi = async (token, payload) => {
  const response = await fetch(NOTIFICATION_ENDPOINTS.BROADCAST, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to send notification broadcast.');
  }
  return data;
};
