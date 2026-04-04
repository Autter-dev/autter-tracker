import { execFileSync } from "node:child_process";

import {
  isLoggedIn,
  requestDeviceCode,
  pollForToken,
  writeTokens,
} from "../auth";
import { bold, cyan, dim, green, red, yellow } from "../utils";

function tryOpenBrowser(url: string): boolean {
  const commands: Record<string, string[]> = {
    darwin: ["open", [url]],
    linux: ["xdg-open", [url]],
    win32: ["cmd", ["/c", "start", url]],
  } as unknown as Record<string, string[]>;

  const entry = commands[process.platform];
  if (!entry) return false;

  try {
    const [cmd, ...args] = entry as [string, ...string[]];
    execFileSync(cmd!, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function loginCommand(): Promise<void> {
  if (isLoggedIn()) {
    process.stdout.write(yellow("Already logged in.") + "\n");
    process.stdout.write(
      dim('Run "autter-tracker logout" first to switch accounts.\n'),
    );
    return;
  }

  process.stdout.write(dim("Requesting device code...") + "\n");

  let deviceCodeResponse;
  try {
    deviceCodeResponse = await requestDeviceCode();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(red(`Error: ${msg}`) + "\n");
    process.exitCode = 1;
    return;
  }

  const {
    device_code,
    user_code,
    verification_uri,
    verification_uri_complete,
    expires_in,
    interval,
  } = deviceCodeResponse;

  const displayUrl = verification_uri_complete ?? verification_uri;

  process.stdout.write("\n");
  process.stdout.write(bold("  Authenticate autter-tracker") + "\n\n");
  process.stdout.write(`  Visit:  ${cyan(displayUrl)}\n`);
  process.stdout.write(`  Code:   ${bold(user_code)}\n\n`);

  const opened = tryOpenBrowser(displayUrl);
  if (opened) {
    process.stdout.write(dim("  Browser opened automatically.") + "\n");
  } else {
    process.stdout.write(dim("  Open the URL above in your browser.") + "\n");
  }

  process.stdout.write(dim("\n  Waiting for authorization...") + "\n");

  try {
    const tokens = await pollForToken(device_code, interval, expires_in);
    writeTokens(tokens);
    process.stdout.write("\n" + green("Logged in successfully.") + "\n");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(red(`\nError: ${msg}`) + "\n");
    process.exitCode = 1;
  }
}
