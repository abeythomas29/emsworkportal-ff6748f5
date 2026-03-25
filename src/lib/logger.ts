export function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
}

export function logDebug(context: string, ...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log(`[${context}]`, ...args);
  }
}
