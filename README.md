# autter-tracker

A lightweight, extensible event tracking library for Node.js and the browser. Features automatic batching, retry with exponential backoff, a plugin system, and full TypeScript support.

## Features

- **Batching** — events are queued and flushed in configurable batches
- **Retry with backoff** — failed flushes are retried with exponential backoff
- **Plugin system** — transform, enrich, or filter events before they are sent
- **Session & user tracking** — automatic session IDs, manual user identification
- **TypeScript-first** — written in TypeScript with full type exports
- **Tree-shakeable** — ESM and CJS dual-package output

## Installation

```bash
npm install autter-tracker
```

## Quick Start

```typescript
import { Tracker } from "autter-tracker";

const tracker = new Tracker({
  transport: async (events) => {
    await fetch("https://analytics.example.com/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events),
    });
  },
  batchSize: 10,
  flushInterval: 5000,
});

// Identify the user
tracker.identify("user-42");

// Track events
tracker.track("page_view", { url: "/dashboard" });
tracker.track("button_click", { button: "upgrade", plan: "pro" });

// Flush remaining events on shutdown
await tracker.destroy();
```

## Configuration

| Option          | Type                                        | Default  | Description                                 |
| --------------- | ------------------------------------------- | -------- | ------------------------------------------- |
| `transport`     | `(events: TrackerEvent[]) => Promise<void>` | required | Delivers events to your backend             |
| `batchSize`     | `number`                                    | `10`     | Max events per flush                        |
| `flushInterval` | `number`                                    | `5000`   | Auto-flush interval in ms (0 to disable)    |
| `maxRetries`    | `number`                                    | `3`      | Retry attempts for failed flushes           |
| `retryDelay`    | `number`                                    | `1000`   | Base delay in ms for exponential backoff    |
| `plugins`       | `TrackerPlugin[]`                           | `[]`     | Plugins to process events                   |
| `onFlush`       | `(events) => void`                          | —        | Called after a successful flush             |
| `onError`       | `(error, events) => void`                   | —        | Called when a flush fails after all retries |

## Plugins

Plugins intercept events before they enter the queue. Each plugin has a `process` function that receives an event and returns a (possibly modified) event or `null` to drop it.

### Built-in Plugins

```typescript
import { createConsolePlugin, createTimestampPlugin, createFilterPlugin } from "autter-tracker";

const tracker = new Tracker({
  transport: myTransport,
  plugins: [
    createConsolePlugin(), // logs every event to the console
    createTimestampPlugin(), // enriches events with _enrichedAt
    createFilterPlugin({
      // drops events by name
      blockList: ["debug_event"],
    }),
  ],
});
```

### Custom Plugin

```typescript
import type { TrackerPlugin } from "autter-tracker";

const myPlugin: TrackerPlugin = {
  name: "add-env",
  process: (event) => ({
    ...event,
    properties: {
      ...event.properties,
      env: process.env.NODE_ENV,
    },
  }),
};

tracker.addPlugin(myPlugin);
```

## API

### `new Tracker(config)`

Creates a new tracker instance.

### `tracker.track(name, properties?)`

Queues an event. Auto-flushes when `batchSize` is reached.

### `tracker.identify(userId)`

Attaches a user ID to all subsequent events.

### `tracker.resetSession()`

Generates a new session ID.

### `tracker.flush()`

Manually sends all queued events.

### `tracker.destroy()`

Flushes remaining events and stops the auto-flush timer. No events are tracked after this call.

### `tracker.addPlugin(plugin)` / `tracker.removePlugin(name)`

Dynamically add or remove plugins at runtime.

### `tracker.getQueueSize()`

Returns the number of events currently in the queue.

## Development

```bash
npm install          # install dependencies
npm run build        # build the package
npm test             # run tests
npm run test:coverage # run tests with coverage
npm run lint         # run ESLint
npm run format       # run Prettier
npm run typecheck    # run TypeScript type checking
```

## License

MIT
