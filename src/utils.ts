let sessionCounter = 0;

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  sessionCounter++;
  return `${timestamp}-${random}-${sessionCounter.toString(36)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function now(): number {
  return Date.now();
}
