// @ts-check
import { constantNames, consumerIds, traceExecutionFlow } from "./connections.mjs";
import { validateU64 } from "./u64.mjs";

const itemBindings = /** @type {const} */ ({
  require: { fn: "inventory::require_item", item: "FERAL_DATA" },
  transfer: { fn: "inventory::transfer_item", item: "EU_40" },
});

/** @typedef {{text: string, owners: string[]}} SourceLine */
/** Positions are deliberately not an input: moving nodes cannot affect source.
 * @param {Record<string, string>} values
 * @param {import("./connections.mjs").FlowConnection[]} connections
 * @param {Record<string, string>} [customNames]
 * @param {Record<string, import("./connections.mjs").SocketType>} [customTypes]
 * @returns {{errors: string[], lines: SourceLine[]}}
 */
export function formatSource(values, connections, customNames, customTypes) {
  const errors = /** @type {string[]} */ ([]);
  const resolvedNames = /** @type {Record<string, string>} */ ({});
  for (const id of constantNames) {
    resolvedNames[id] = customNames?.[id] ?? id;
  }

  const literals = constantNames.map(id => {
    const type = customTypes?.[id] ?? "u64";
    const val = values[id] ?? "";
    const displayName = resolvedNames[id];
    if (type === "u64") {
      const result = validateU64(val);
      if (result.error) errors.push(displayName + ": " + result.error);
      return result.literal;
    }
    if (type === "boolean") {
      const trimmed = val.trim().toLowerCase();
      if (trimmed !== "true" && trimmed !== "false") {
        errors.push(displayName + ": Boolean must be 'true' or 'false'");
      }
      return trimmed === "true" ? "true" : "false";
    }
    if (type === "item") {
      const trimmed = val.trim();
      if (!trimmed || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
        errors.push(displayName + ": Item must be a valid identifier");
      }
      return trimmed;
    }
    return val;
  });

  const execution = traceExecutionFlow(connections);
  if (execution.error) {
    errors.push(execution.error);
  }

  /** @type {Record<string, string | undefined>} */
  const quantitySources = {};
  for (const id of consumerIds) {
    const source = connections.find(edge => edge.target === id && edge.targetHandle === "quantity")?.source;
    const activeInFlow = execution.steps.includes(id) || Boolean(execution.error);
    if (activeInFlow) {
      if (!source || !constantNames.some(name => name === source)) {
        errors.push(id + " quantity: connect a Primitive Constant (u64).");
      } else if ((customTypes?.[source] ?? "u64") !== "u64") {
        errors.push(id + " quantity: connected constant " + (customNames?.[source] ?? source) + " is not u64.");
      }
    }
    quantitySources[id] = source ? (resolvedNames[source] ?? source) : undefined;
  }

  if (errors.length) return { errors, lines: [] };

  const bodyLines = /** @type {SourceLine[]} */ ([]);
  for (const step of execution.steps) {
    if (step === "start") {
      bodyLines.push({
        text: "        let mut req = entity::start_request(storage);",
        owners: ["start"],
      });
    } else if (step === "require" || step === "transfer") {
      const binding = itemBindings[step];
      const source = quantitySources[step] ?? "";
      // Find original constant id for owner tracking
      const origSourceId = connections.find(edge => edge.target === step && edge.targetHandle === "quantity")?.source ?? "";
      bodyLines.push({
        text: `        ${binding.fn}(&mut req, ${binding.item}, ${source});`,
        owners: [step, origSourceId || source],
      });
    } else if (step === "complete") {
      bodyLines.push({
        text: "        request::complete_request(req);",
        owners: ["complete"],
      });
    }
  }

  return {
    errors: [],
    lines: [
      { text: "module preview::exchange {", owners: [] },
      ...constantNames.map((id, index) => {
        const type = customTypes?.[id] ?? "u64";
        const name = resolvedNames[id];
        return {
          text: `    const ${name}: ${type === "item" ? "ItemId" : type === "boolean" ? "bool" : "u64"} = ${literals[index]};`,
          owners: [id, name],
        };
      }),
      { text: "", owners: [] },
      { text: "    public fun execute(storage: &mut Entity, FERAL_DATA: ItemId, EU_40: ItemId) {", owners: [] },
      ...bodyLines,
      { text: "    }", owners: [] },
      { text: "}", owners: [] },
    ],
  };
}

/** @param {SourceLine[]} lines @param {string | null} selection */
export function correspondingLines(lines, selection) {
  return lines.flatMap((line, index) => selection && line.owners.includes(selection) ? [index + 1] : []);
}
