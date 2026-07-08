import axios from "axios";

import type { ApiErrorResponse } from "../types/api";

type ParsedApiError = {
  message: string;
  fieldErrors: Record<string, string>;
};

export function parseApiError(error: unknown): ParsedApiError {
  const fieldErrors: Record<string, string> = {};
  let message = "Something went wrong. Please try again.";

  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    message = data.message;

    if (data.errors) {
      for (const [field, messages] of Object.entries(data.errors)) {
        const firstMessage = messages?.[0];

        if (firstMessage) {
          fieldErrors[field] = firstMessage;
        }
      }
    }
  }

  return { message, fieldErrors };
}
