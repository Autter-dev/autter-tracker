import type { TrackerPlugin } from "../types";

export interface FilterPluginOptions {
  /** Event names to allow. If set, only these events pass through. */
  allowList?: string[];
  /** Event names to block. These events are dropped. */
  blockList?: string[];
}

export function createFilterPlugin(options: FilterPluginOptions): TrackerPlugin {
  return {
    name: "filter",
    process: (event) => {
      if (options.blockList?.includes(event.name)) {
        return null;
      }
      if (options.allowList && !options.allowList.includes(event.name)) {
        return null;
      }
      return event;
    },
  };
}
