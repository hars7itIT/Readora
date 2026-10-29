export function formatSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export function getStatusCodeFromError(error: unknown): number {
  const message = formatSafeErrorMessage(error);
  if (/private|local|invalid url|only http|credentials|port|hostname/i.test(message)) {
    return 400;
  }
  if (/timed out/i.test(message)) {
    return 504;
  }
  return 502;
}
