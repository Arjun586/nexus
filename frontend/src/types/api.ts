export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
};
