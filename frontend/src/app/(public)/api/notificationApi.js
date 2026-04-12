import {
  NOTIFICATION_ENDPOINTS,
  parseJsonResponse,
} from '@/app/(shared)/lib/apiConfig';

export const updateNotificationPermissionApi = async (
  token,
  permissionPayload,
) => {
  const response = await fetch(NOTIFICATION_ENDPOINTS.PERMISSION, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(permissionPayload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(
      data.detail || 'Failed to save notification permission.',
    );
  }
  return data;
};
