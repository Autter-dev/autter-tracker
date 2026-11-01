import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Guards the CVE fixes that bump vulnerable dependencies to their fixed
 * versions (see .autter/result.json). These manifests are the source of
 * truth for the resolved versions the CLI and API actually ship with.
 */
function lockfilePath(): string {
  // The CLI tests usually run with cwd = packages/cli; also tolerate running
  // from the repository root.
  const fromCli = resolve(process.cwd(), "..", "..", "package-lock.json");
  if (existsSync(fromCli)) return fromCli;
  return resolve(process.cwd(), "package-lock.json");
}

function resolvedVersion(name: string): string | undefined {
  const lock = JSON.parse(
    readFileSync(lockfilePath(), "utf8"),
  ) as { packages: Record<string, { version?: string }> };
  const suffix = `/node_modules/${name}`;
  const candidates = Object.keys(lock.packages).filter(
    (key) => key === suffix.slice(1) || key.endsWith(suffix),
  );
  // Prefer the shallowest (root-most) location.
  candidates.sort((a, b) => a.split("/").length - b.split("/").length);
  return candidates[0] ? lock.packages[candidates[0]]?.version : undefined;
}

describe("CVE dependency bumps", () => {
  const expected: Array<[string, string]> = [
    ["better-auth", "1.6.11"],
    ["@better-auth/passkey", "1.6.11"],
    ["drizzle-orm", "0.45.2"],
    ["hono", "4.12.25"],
    ["zod", "4.6.6"],
    ["kysely", "0.28.17"],
    ["source-map-js", "1.2.2"],
  ];

  it.each(expected)("%s resolves to fixed version %s", (name, version) => {
    expect(resolvedVersion(name), `resolved version of ${name}`).toBe(version);
  });

  it("glob and minimatch (via test-exclude) resolve to CVE-fixed versions", () => {
    // GHSA-3g3m-2fjr-6pw4 (glob) and GHSA-g3hv-75wg-m249 (minimatch)
    // are fixed in glob@14.0.2 and minimatch@11.0.1 respectively.
    const lock = JSON.parse(
      readFileSync(lockfilePath(), "utf8"),
    ) as { packages: Record<string, { version?: string }> };
    expect(
      lock.packages["node_modules/test-exclude/node_modules/glob"]?.version,
      "resolved version of glob (transitive via test-exclude)",
    ).toBe("14.0.2");
    expect(
      lock.packages["node_modules/test-exclude/node_modules/glob/node_modules/minimatch"]?.version,
      "resolved version of minimatch (transitive via test-exclude/glob)",
    ).toBe("11.0.1");
  });
});
