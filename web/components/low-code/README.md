# Low-code UI previews

From `web/`:

- `pnpm install --frozen-lockfile`
- `pnpm storybook` — Components / Low Code / ReactFlow Working Example; All precedes Playground.
- `pnpm build-storybook` — static preview.
- `node --test components/low-code/preview.test.mjs` — repeatable, zero-dependency pure-logic checks.
- `pnpm lint`, `pnpm exec next typegen`, `pnpm exec tsc --noEmit`, `pnpm build` — local validation. Type generation supplies Next's LayoutProps on a fresh checkout.

Start with `CONSTANT_A` and `CONSTANT_B` independently wired to `Require Item` and
`Transfer Item`, and a complete Execution flow (`Start Request` → `Require Item` →
`Transfer Item` → `Complete Request`).

- **Move/SDK primitives:** `OperationNode` maps directly to high-level Move/SDK
  primitives (`entity::start_request`, `inventory::require_item`,
  `inventory::transfer_item`, `assert!`, `request::complete_request`) parameterized
  by item/entity fixtures rather than hardcoding exercise-specific node types.
- **Wireable Execution flow:** `exec` sockets (`Request out` → `Request in`) are
  editable on the canvas and via keyboard/pointer controls. Rewiring the execution
  chain reorders emitted Move statements; breaking the chain from `Start Request` to
  `Complete Request` withholds source until the linear `Request` is consumed.
- **Coloured typed sockets and wires:** `execution` (`▸ exec`), `u64` (`● u64`),
  `item` (`◆ item`), and `boolean` (`▲ bool`) each have distinct theme-aware colours,
  port shapes, and badges.
- **Contour-following selection and focus:** `NodeShell` uses `Plate` keylines and
  an outer clipped `Plate` ring (`tr-bl` chamfers) rather than a rectangular outline.
- **Non-overlapping layout & hover-based connection tracing:** Two-tier canvas layout
  cleanly separates upstream constant definitions (top tier) from the linear execution pipeline
  (bottom tier), preventing wire crossing. Hovering over any block dynamically illuminates all
  connected wires and partner blocks with zero button or badge clutter; clicking pins the Move
  source code inspection.

Field text is retained exactly; surrounding whitespace and leading zeros are
accepted and source literals canonicalised. Zero through the u64 maximum is valid.
Invalid values never remove or prevent typed wiring. Any invalid displayed
constant, incomplete execution chain, or missing quantity input withholds source.

## Scope

This is a local Storybook increment, not a lesson route, full Move type checker,
contract generator, compiler, inventory checker, wallet or deployment UI.
The illustrative Move is **uncompiled and not the vending contract**.
Only copyable u64 fan-out and linear 1-to-1 Request execution wiring are supported.
Exercise quantities must still be positive; the finalised contract snapshot and
real-build acceptance gates remain prerequisites for the complete exercise.

Actual validation results are recorded in VALIDATION.md.
