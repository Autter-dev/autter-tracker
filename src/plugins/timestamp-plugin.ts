import type { TrackerPlugin } from "../types";
import { now } from "../utils";

export function createTimestampPlugin(): TrackerPlugin {
  return {
    name: "timestamp",
    process: (event) => ({
      ...event,
      timestamp: event.timestamp || now(),
      properties: {
        ...event.properties,
        _enrichedAt: now(),
      },
    }),
  };
}
