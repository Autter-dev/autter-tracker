# Memory — autter-tracker

This is a living document that captures decisions, known issues, and context that evolve with the project. It is intended to be updated as the project progresses.

## Architecture Decisions

- **Transport-agnostic** — the `Tracker` does not include any HTTP client. Consumers provide their own `transport` function, keeping the package dependency-free and environment-agnostic (Node, browser, edge).
- **Plugin pipeline** — events pass through plugins synchronously before being queued. Plugins can transform or drop events. This was chosen over an async middleware chain for simplicity and predictability.
- **Exponential backoff** — retry delay doubles on each attempt (`retryDelay * 2^attempt`). Failed events are re-queued at the front to preserve ordering.
- **No external dependencies** — the library has zero runtime dependencies to minimise bundle size and supply chain risk.

## Known Limitations

- Plugins run synchronously — async enrichment (e.g., fetching geo data) must be handled outside the plugin pipeline.
- No built-in persistence — if the process crashes, queued events are lost. Consumers needing durability should implement a persistent transport or queue.
- No deduplication — re-queued events after retry exhaustion may be sent again on the next flush cycle.

## Changelog

| Date       | Change                                                                    |
| ---------- | ------------------------------------------------------------------------- |
| 2026-04-04 | Initial implementation: core tracker, 3 built-in plugins, full test suite |
