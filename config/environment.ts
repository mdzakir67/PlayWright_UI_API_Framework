import { z } from 'zod';

const configSchema = z.object({
  uiBaseURL: z.url(),
  apiBaseURL: z.url(),
});

const configValues = {
  uiBaseURL:
    process.env.UI_BASE_URL ??
    'https://eventhub.rahulshettyacademy.com',

  apiBaseURL:
    process.env.API_BASE_URL ??
    'https://api.eventhub.rahulshettyacademy.com/api',
};

export const config = configSchema.parse(configValues);