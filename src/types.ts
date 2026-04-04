export interface TrackerEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

export interface TrackerConfig {
  /** Maximum number of events to batch before flushing */
  batchSize: number;
  /** Interval in milliseconds to auto-flush queued events */
  flushInterval: number;
  /** Maximum number of retry attempts for failed flushes */
  maxRetries: number;
  /** Base delay in milliseconds for exponential backoff */
  retryDelay: number;
  /** Transport function to deliver events to your backend */
  transport: TransportFn;
  /** Plugins to process events through */
  plugins?: TrackerPlugin[];
  /** Called when events are successfully flushed */
  onFlush?: (events: TrackerEvent[]) => void;
  /** Called when an error occurs during flush */
  onError?: (error: Error, events: TrackerEvent[]) => void;
}

export type TransportFn = (events: TrackerEvent[]) => Promise<void>;

export interface TrackerPlugin {
  name: string;
  /** Transform or enrich an event before it is queued. Return null to drop the event. */
  process: (event: TrackerEvent) => TrackerEvent | null;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
