# Preview validation — 2026-10-24

This records local UI-preview checks, **not** production exercise acceptance,
Move compiler acceptance, inventory enforcement or deployment.

## Commands actually executed

From `web/`, Node 24.21.0 and pnpm:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed before adding ReactFlow. |
| `pnpm exec next typegen` | Passed; generated missing `LayoutProps` on the fresh checkout. |
| `pnpm lint` | Passed. |
| `pnpm exec tsc --noEmit` | Passed. |
| `pnpm build` | Passed; existing `/` and `/_not-found` routes built. |
| `pnpm build-storybook` | Passed; existing dependency `use client` bundling warnings and chunk-size advisory remain. |
| `node --test components/low-code/preview.test.mjs` | Passed: 13 tests, 0 failures. |

## What the focused checks cover

- **Move/SDK primitive mapping (`OperationNode`):** `Start Request`
  (`entity::start_request`), `Require Item` (`inventory::require_item`),
  `Transfer Item` (`inventory::transfer_item`), `Assert Condition` (`assert!`), and
  `Complete Request` (`request::complete_request`) with configurable `item` bindings
  and source correspondence (`owners`) on every operation node.
- **Wireable Execution flow (`traceExecutionFlow`):** `exec-out` → `exec-in`
  connections are editable, enforce linear `Request` rules (no branching from one
  `exec-out`, no cycles, must connect `Start Request` through to `Complete Request`),
  and directly control statement order in `formatSource`.
- **Typed coloured sockets and edges (`socketTypes`):** `execution`, `u64`, `item`,
  and `boolean` sockets and edges carry distinct theme-aware colours, glyphs, and
  port shapes (`square`, `circle`, `diamond`, `rounded`), rejecting cross-type
  connections with explicit type-mismatch messages.
- **Contour-following node borders (`Plate`):** `NodeShell` renders an inner
  `Plate` surface and outer `Plate` focus/selection ring with matching `tr-bl`
  chamfers (`calc(var(--cut-md) + 2.343px)`), avoiding rectangular dotted outlines.
- **Non-overlapping block layout & left-to-right routing:** Two-tier canvas
  architecture places Primitive Constants in the upper tier (`y: 30`) upstream of
  their consumer blocks, with operation pipeline execution flowing horizontally along
  the lower tier (`y: 340`). Data input sockets (`Quantity in`) enter the top socket
  row of operation nodes, while execution sockets (`Request in` / `Request out`) route
  along the bottom socket row, preventing value wires from ever intersecting or
  crossing execution wires.
- **Hover-based connection tracing:** Hovering over any block dynamically activates
  an animated glowing flow along all connected wires (`.tracedEdge`), illuminates
  dependency partner blocks with glowing keylines, and previews corresponding declaration
  and usage lines (`▶`) in the Move source preview without any button or badge clutter in
  the card headers. Clicking a block pins the selection.
- **u64 validation & fan-out:** exact u64 boundaries, whitespace/leading-zero
  canonicalisation, copyable `u64` fan-out across multiple inputs, and source
  withholding on any invalid constant, missing quantity, or incomplete Request chain.
