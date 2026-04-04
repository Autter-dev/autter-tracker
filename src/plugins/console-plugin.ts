import type { TrackerPlugin } from "../types";

export function createConsolePlugin(): TrackerPlugin {
  return {
    name: "console",
    process: (event) => {
      // eslint-disable-next-line no-console
      console.log(`[autter-tracker] ${event.name}`, event.properties ?? {});
      return event;
    },
  };
}
