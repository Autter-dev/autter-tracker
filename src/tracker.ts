import type { DeepPartial, TrackerConfig, TrackerEvent, TrackerPlugin, TransportFn } from "./types";
import { generateId, now, sleep } from "./utils";

const DEFAULT_CONFIG: TrackerConfig = {
  batchSize: 10,
  flushInterval: 5000,
  maxRetries: 3,
  retryDelay: 1000,
  transport: async () => {
    /* noop default transport */
  },
};

export class Tracker {
  private config: TrackerConfig;
  private queue: TrackerEvent[] = [];
  private plugins: TrackerPlugin[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;
  private userId: string | undefined;
  private _flushing = false;
  private _destroyed = false;

  constructor(config: DeepPartial<TrackerConfig> & { transport: TransportFn }) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.plugins = this.config.plugins ?? [];
    this.sessionId = generateId();
    this.startAutoFlush();
  }

  track(name: string, properties?: Record<string, unknown>): void {
    if (this._destroyed) {
      return;
    }

    let event: TrackerEvent | null = {
      name,
      properties,
      timestamp: now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    for (const plugin of this.plugins) {
      if (!event) break;
      event = plugin.process(event);
    }

    if (!event) return;

    this.queue.push(event);

    if (this.queue.length >= this.config.batchSize) {
      void this.flush();
    }
  }

  identify(userId: string): void {
    this.userId = userId;
  }

  resetSession(): void {
    this.sessionId = generateId();
  }

  addPlugin(plugin: TrackerPlugin): void {
    this.plugins.push(plugin);
  }

  removePlugin(name: string): void {
    this.plugins = this.plugins.filter((p) => p.name !== name);
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  async flush(): Promise<void> {
    if (this._flushing || this.queue.length === 0) {
      return;
    }

    this._flushing = true;
    const batch = this.queue.splice(0, this.config.batchSize);

    try {
      await this.sendWithRetry(batch);
      this.config.onFlush?.(batch);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.config.onError?.(err, batch);
      // Re-queue failed events at the front
      this.queue.unshift(...batch);
    } finally {
      this._flushing = false;
    }
  }

  async destroy(): Promise<void> {
    this._destroyed = true;
    this.stopAutoFlush();
    if (this.queue.length > 0) {
      await this.flush();
    }
  }

  private async sendWithRetry(events: TrackerEvent[]): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        await this.config.transport(events);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private startAutoFlush(): void {
    if (this.config.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, this.config.flushInterval);
    }
  }

  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
