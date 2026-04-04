import { describe, it, expect, vi } from "vitest";

import { createConsolePlugin } from "../src/plugins/console-plugin";
import { createFilterPlugin } from "../src/plugins/filter-plugin";
import { createTimestampPlugin } from "../src/plugins/timestamp-plugin";
import type { TrackerEvent } from "../src/types";

function makeEvent(overrides: Partial<TrackerEvent> = {}): TrackerEvent {
  return {
    name: "test_event",
    properties: {},
    timestamp: 1000,
    sessionId: "session-1",
    ...overrides,
  };
}

describe("ConsolePlugin", () => {
  it("should log the event and pass it through", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const plugin = createConsolePlugin();
    const event = makeEvent({ name: "page_view", properties: { url: "/" } });

    const result = plugin.process(event);

    expect(result).toEqual(event);
    expect(consoleSpy).toHaveBeenCalledWith("[autter-tracker] page_view", { url: "/" });
    consoleSpy.mockRestore();
  });

  it("should log empty object when no properties", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const plugin = createConsolePlugin();
    const event = makeEvent({ properties: undefined });

    plugin.process(event);

    expect(consoleSpy).toHaveBeenCalledWith("[autter-tracker] test_event", {});
    consoleSpy.mockRestore();
  });
});

describe("TimestampPlugin", () => {
  it("should enrich event with _enrichedAt property", () => {
    const plugin = createTimestampPlugin();
    const event = makeEvent();

    const result = plugin.process(event);

    expect(result).not.toBeNull();
    expect(result!.properties!["_enrichedAt"]).toBeTypeOf("number");
  });

  it("should preserve existing timestamp", () => {
    const plugin = createTimestampPlugin();
    const event = makeEvent({ timestamp: 999 });

    const result = plugin.process(event);

    expect(result!.timestamp).toBe(999);
  });
});

describe("FilterPlugin", () => {
  it("should block events in blockList", () => {
    const plugin = createFilterPlugin({ blockList: ["debug_event"] });
    const event = makeEvent({ name: "debug_event" });

    const result = plugin.process(event);

    expect(result).toBeNull();
  });

  it("should allow events not in blockList", () => {
    const plugin = createFilterPlugin({ blockList: ["debug_event"] });
    const event = makeEvent({ name: "page_view" });

    const result = plugin.process(event);

    expect(result).toEqual(event);
  });

  it("should only allow events in allowList", () => {
    const plugin = createFilterPlugin({ allowList: ["page_view", "click"] });

    expect(plugin.process(makeEvent({ name: "page_view" }))).not.toBeNull();
    expect(plugin.process(makeEvent({ name: "click" }))).not.toBeNull();
    expect(plugin.process(makeEvent({ name: "scroll" }))).toBeNull();
  });

  it("should prioritize blockList over allowList", () => {
    const plugin = createFilterPlugin({
      allowList: ["page_view"],
      blockList: ["page_view"],
    });

    expect(plugin.process(makeEvent({ name: "page_view" }))).toBeNull();
  });

  it("should allow all events when no lists configured", () => {
    const plugin = createFilterPlugin({});
    const event = makeEvent();

    expect(plugin.process(event)).toEqual(event);
  });
});
