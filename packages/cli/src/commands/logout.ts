import { clearTokens, isLoggedIn } from "../auth";
import { dim, green, yellow } from "../utils";

export function logoutCommand(): void {
  if (!isLoggedIn()) {
    process.stdout.write(yellow("Not currently logged in.") + "\n");
    return;
  }

  clearTokens();
  process.stdout.write(green("Logged out.") + "\n");
  process.stdout.write(dim("Local tracking data is unaffected.\n"));
}
