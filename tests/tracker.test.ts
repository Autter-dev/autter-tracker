import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { Tracker } from "../src/tracker";
import type { TrackerEvent, TransportFn } from "../src/types";

describe("Tracker", () => {
  let transport: TransportFn;
  let transportCalls: TrackerEvent[][];

  beforeEach(() => {
    transportCalls = [];
    transport = vi.fn((events: TrackerEvent[]) => {
      transportCalls.push([...events]);
      return Promise.resolve();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createTracker(overrides = {}) {
    return new Tracker({
      transport,
      batchSize: 3,
      flushInterval: 0, // disable auto-flush for tests
      maxRetries: 2,
      retryDelay: 10,
      ...overrides,
    });
  }

  describe("track()", () => {
    it("should queue events", () => {
      const tracker = createTracker();
      tracker.track("page_view", { url: "/home" });
      expect(tracker.getQueueSize()).toBe(1);
    });

    it("should include timestamp, sessionId in events", async () => {
      const tracker = createTracker({ batchSize: 1 });
      tracker.track("click", { button: "submit" });

      // Wait for auto-flush triggered by batchSize
      await vi.waitFor(() => expect(transport).toHaveBeenCalled());

      const event = transportCalls[0]![0]!;
      expect(event.name).toBe("click");
      expect(event.properties).toEqual({ button: "submit" });
      expect(event.timestamp).toBeTypeOf("number");
      expect(event.sessionId).toBeTypeOf("string");
    });

    it("should auto-flush when batchSize is reached", async () => {
      const tracker = createTracker({ batchSize: 2 });
      tracker.track("event1");
      tracker.track("event2");

      await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(1));
      expect(transportCalls[0]).toHaveLength(2);
    });

    it("should not track after destroy", async () => {
      const tracker = createTracker();
      await tracker.destroy();
      tracker.track("late_event");
      expect(tracker.getQueueSize()).toBe(0);
    });
  });

  describe("identify()", () => {
    it("should attach userId to subsequent events", async () => {
      const tracker = createTracker({ batchSize: 1 });
      tracker.identify("user-123");
      tracker.track("login");

      await vi.waitFor(() => expect(transport).toHaveBeenCalled());
      expect(transportCalls[0]![0]!.userId).toBe("user-123");
    });
  });

  describe("resetSession()", () => {
    it("should generate a new sessionId", async () => {
      const tracker = createTracker();
      tracker.track("event1");
      await tracker.flush();

      const firstSessionId = transportCalls[0]![0]!.sessionId;
      tracker.resetSession();
      tracker.track("event2");
      await tracker.flush();

      const secondSessionId = transportCalls[1]![0]!.sessionId;

      expect(firstSessionId).not.toBe(secondSessionId);
    });
  });

  describe("flush()", () => {
    it("should send queued events via transport", async () => {
      const tracker = createTracker();
      tracker.track("e1");
      tracker.track("e2");
      await tracker.flush();

      expect(transport).toHaveBeenCalledTimes(1);
      expect(transportCalls[0]).toHaveLength(2);
      expect(tracker.getQueueSize()).toBe(0);
    });

    it("should be a no-op when queue is empty", async () => {
      const tracker = createTracker();
      await tracker.flush();
      expect(transport).not.toHaveBeenCalled();
    });

    it("should call onFlush callback on success", async () => {
      const onFlush = vi.fn();
      const tracker = createTracker({ onFlush });
      tracker.track("e1");
      await tracker.flush();
      expect(onFlush).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: "e1" })]),
      );
    });

    it("should call onError and re-queue on failure", async () => {
      const failingTransport = vi.fn(() => {
        return Promise.reject(new Error("network error"));
      });
      const onError = vi.fn();
      const tracker = createTracker({
        transport: failingTransport,
        onError,
        maxRetries: 0,
      });

      tracker.track("e1");
      await tracker.flush();

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "network error" }),
        expect.any(Array),
      );
      expect(tracker.getQueueSize()).toBe(1);
    });
  });

  describe("retry logic", () => {
    it("should retry on failure and succeed", async () => {
      let callCount = 0;
      const flakyTransport = vi.fn(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error("temporary failure"));
        }
        return Promise.resolve();
      });

      const tracker = createTracker({ transport: flakyTransport, maxRetries: 3 });
      tracker.track("retry-event");
      await tracker.flush();

      expect(flakyTransport).toHaveBeenCalledTimes(3);
      expect(tracker.getQueueSize()).toBe(0);
    });

    it("should exhaust retries and re-queue", async () => {
      const alwaysFails = vi.fn(() => {
        return Promise.reject(new Error("permanent failure"));
      });

      const tracker = createTracker({ transport: alwaysFails, maxRetries: 1 });
      tracker.track("doomed-event");
      await tracker.flush();

      // 1 initial + 1 retry = 2 calls
      expect(alwaysFails).toHaveBeenCalledTimes(2);
      expect(tracker.getQueueSize()).toBe(1);
    });
  });

  describe("destroy()", () => {
    it("should flush remaining events and stop the timer", async () => {
      const tracker = createTracker();
      tracker.track("final-event");
      await tracker.destroy();

      expect(transport).toHaveBeenCalledTimes(1);
      expect(tracker.getQueueSize()).toBe(0);
    });
  });

  describe("plugins", () => {
    it("should add and remove plugins", () => {
      const tracker = createTracker();
      const plugin = {
        name: "test-plugin",
        process: (e: TrackerEvent) => e,
      };

      tracker.addPlugin(plugin);
      tracker.track("test");
      expect(tracker.getQueueSize()).toBe(1);

      tracker.removePlugin("test-plugin");
    });
  });
});
