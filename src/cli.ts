import { parseArgs } from "node:util";

import { initCommand } from "./commands/init";
import { logCommand } from "./commands/log";
import { statsCommand } from "./commands/stats";
import { uninstallCommand } from "./commands/uninstall";
import { runHook } from "./hook";
import { bold, dim } from "./utils";

const VERSION = "0.1.0";

function printHelp(): void {
  process.stdout.write(`
${bold("autter-tracker")} — track AI-assisted git commits

${bold("Usage:")}
  autter-tracker <command> [options]

${bold("Commands:")}
  init          Install the post-commit hook in the current repo
  stats         Show AI commit statistics
  log           Show recent AI-detected commits
  uninstall     Remove the post-commit hook

${bold("Options:")}
  --help, -h    Show this help message
  --version     Show version

${dim("https://github.com/sagnikghosh/autter-tracker")}
`);
}

function main(): void {
  const command = process.argv[2];

  switch (command) {
    case "init":
      initCommand();
      break;
    case "stats":
      statsCommand();
      break;
    case "log": {
      const { values } = parseArgs({
        args: process.argv.slice(3),
        options: {
          limit: { type: "string", short: "n", default: "20" },
        },
        strict: false,
      });
      logCommand(parseInt(values["limit"] as string, 10) || 20);
      break;
    }
    case "uninstall": {
      const { values } = parseArgs({
        args: process.argv.slice(3),
        options: {
          clean: { type: "boolean", default: false },
        },
        strict: false,
      });
      uninstallCommand(values["clean"] as boolean);
      break;
    }
    case "hook":
      try {
        runHook();
      } catch {
        // Hooks should never block commits
      }
      break;
    case "--version":
    case "-v":
      process.stdout.write(`autter-tracker v${VERSION}\n`);
      break;
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    default:
      process.stderr.write(`Unknown command: ${command}\nRun "autter-tracker --help" for usage.\n`);
      process.exitCode = 1;
  }
}

main();
