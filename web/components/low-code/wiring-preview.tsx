"use client";

import { useState, useMemo } from "react";
import {
  ReactFlow, Handle, Position, MarkerType, applyNodeChanges, ConnectionMode,
  Background, BackgroundVariant, Controls, MiniMap, Panel,
  type Node, type NodeProps, type Edge, type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import {
  PrimitiveConstant,
  OperationNode,
  socketPortClassName,
  type OperationRole,
  type OperationHandleId,
} from "./nodes";
import {
  constantNames,
  consumerIds,
  executionSourceIds,
  executionTargetIds,
  initialConnections,
  connectValue,
  connectionError,
  disconnectValue,
  valueConnection,
  executionConnection,
  traceExecutionFlow,
  type FlowConnection,
  type SocketType,
} from "./connections.mjs";
import { SourcePreview } from "./source-preview";
import styles from "./wiring-preview.module.css";

type PreviewData = {
  role?: OperationRole;
  item?: string;
  name?: string;
  dataType?: SocketType;
  value?: string;
  connected: boolean;
  execInConnected: boolean;
  execOutConnected: boolean;
  selected: boolean;
  highlighted: boolean;
  edit: (text: string) => void;
  onNameChange?: (name: string) => void;
  onTypeChange?: (type: SocketType) => void;
};
type PreviewNode = Node<PreviewData, "preview">;

function CanvasNode({ id, data }: NodeProps<PreviewNode>) {
  if (!data.role) {
    const dataType = data.dataType ?? "u64";
    const displayName = data.name ?? id;
    const handle = (
      <Handle
        type="source"
        position={Position.Right}
        id="value"
        role="group"
        className={socketPortClassName({ direction: "out", type: dataType, connected: data.connected })}
        aria-label={`${displayName} ${dataType} value`}
      />
    );
    return (
      <PrimitiveConstant
        name={displayName}
        dataType={dataType}
        value={data.value ?? ""}
        onChange={data.edit}
        onNameChange={data.onNameChange}
        onTypeChange={data.onTypeChange}
        selected={data.selected}
        highlighted={data.highlighted}
        connected={data.connected}
        handle={handle}
      />
    );
  }

  const quantity = data.role === "Require Item" || data.role === "Transfer Item";
  const handles: Partial<Record<OperationHandleId, React.ReactNode>> = {};

  if (data.role !== "Start Request") {
    handles["exec-in"] = (
      <Handle
        type="target"
        position={Position.Left}
        id="exec-in"
        role="group"
        className={socketPortClassName({ direction: "in", type: "execution", connected: data.execInConnected })}
        aria-label={data.role + " execution Request in"}
      />
    );
  }
  if (data.role !== "Complete Request") {
    handles["exec-out"] = (
      <Handle
        type="source"
        position={Position.Right}
        id="exec-out"
        role="group"
        className={socketPortClassName({ direction: "out", type: "execution", connected: data.execOutConnected })}
        aria-label={data.role + " execution Request out"}
      />
    );
  }
  if (quantity) {
    handles.quantity = (
      <Handle
        type="target"
        position={Position.Left}
        id="quantity"
        role="group"
        className={socketPortClassName({ direction: "in", type: "u64", connected: data.connected })}
        aria-label={data.role + " u64 Quantity in"}
      />
    );
  }

  return (
    <OperationNode
      role={data.role}
      item={data.item}
      connected={data.connected}
      execInConnected={data.execInConnected}
      execOutConnected={data.execOutConnected}
      selected={data.selected}
      highlighted={data.highlighted}
      handles={handles}
    />
  );
}

const nodeTypes = { preview: CanvasNode };

const operations: { id: string; role: OperationRole; item?: string }[] = [
  { id: "start", role: "Start Request" },
  { id: "require", role: "Require Item", item: "FERAL_DATA" },
  { id: "transfer", role: "Transfer Item", item: "EU_40" },
  { id: "complete", role: "Complete Request" },
];

export const initialNodePositions: Record<string, { x: number; y: number }> = {
  // Top tier for Constants: placed upstream/left of consumer so value wires flow smoothly from left-to-right
  CONSTANT_A: { x: 160, y: 30 },
  CONSTANT_B: { x: 640, y: 30 },
  // Bottom tier for Operations: linear execution flow from left to right along the bottom
  start: { x: 40, y: 340 },
  require: { x: 520, y: 340 },
  transfer: { x: 1000, y: 340 },
  complete: { x: 1480, y: 340 },
};

const initialNodes: PreviewNode[] = [
  ...constantNames.map(id => ({
    id,
    type: "preview" as const,
    position: initialNodePositions[id] ?? { x: 0, y: 0 },
    data: {} as PreviewData,
  })),
  ...operations.map(({ id }) => ({
    id,
    type: "preview" as const,
    position: initialNodePositions[id] ?? { x: 0, y: 340 },
    data: {} as PreviewData,
  })),
];

export function WiringPreview({
  initialConnections: customConnections,
  showCodePreview = true,
  showControls = true,
  canvasOnly = false,
}: {
  initialConnections?: FlowConnection[];
  showCodePreview?: boolean;
  showControls?: boolean;
  canvasOnly?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({ CONSTANT_A: "10", CONSTANT_B: "40" });
  const [customNames, setCustomNames] = useState<Record<string, string>>({
    CONSTANT_A: "CONSTANT_A",
    CONSTANT_B: "CONSTANT_B",
  });
  const [customTypes, setCustomTypes] = useState<Record<string, SocketType>>({
    CONSTANT_A: "u64",
    CONSTANT_B: "u64",
  });
  const [connections, setConnections] = useState<FlowConnection[]>(() => customConnections ?? initialConnections());
  const [layout, setLayout] = useState(initialNodes);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [source, setSource] = useState<string>("CONSTANT_A");
  const [target, setTarget] = useState<string>("require");
  const [execSource, setExecSource] = useState<string>("start");
  const [execTarget, setExecTarget] = useState<string>("require");
  const [feedback, setFeedback] = useState(
    "Hover over any block to illuminate its connections and partner blocks. Click to pin Move source inspection."
  );

  const activeId = hoveredNodeId ?? selection;

  function updateConstantType(id: string, newType: SocketType) {
    setCustomTypes(current => ({ ...current, [id]: newType }));
    // If new type is not u64, disconnect any quantity connections from this constant
    if (newType !== "u64") {
      setConnections(current => current.filter(edge => !(edge.source === id && edge.sourceHandle === "value")));
    }
    const currentName = customNames[id] ?? id;
    setFeedback(`Changed ${currentName} type to ${newType}.`);
  }

  function updateConstantName(id: string, newName: string) {
    setCustomNames(current => ({ ...current, [id]: newName }));
    setFeedback(`Renamed constant to ${newName}.`);
  }

  // Canvas and labelled controls use these same mutation functions.
  function connect(connection: Connection) {
    const normalized = {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
    };
    const result = connectValue(connections, normalized, customTypes);
    setConnections(result.edges);
    setFeedback(
      result.error ??
        `Connected ${customNames[normalized.source] ?? normalized.source} (${normalized.sourceHandle}) → ${normalized.target} (${normalized.targetHandle}).`
    );
  }

  function disconnect(input: string, handle: "quantity" | "exec-in" = "quantity") {
    setConnections(current => disconnectValue(current, input, handle));
    setFeedback(
      handle === "quantity"
        ? `${input} u64 quantity disconnected; no default substituted.`
        : `${input} execution Request in disconnected.`
    );
  }

  function swapExecutionOrder() {
    setConnections(current => {
      const valueEdges = current.filter(edge => edge.targetHandle === "quantity");
      const currentExec = traceExecutionFlow(current);
      const isDefaultOrder = currentExec.steps.join("->") === "start->require->transfer->complete";
      const nextExec = isDefaultOrder
        ? [
            executionConnection("start", "transfer"),
            executionConnection("transfer", "require"),
            executionConnection("require", "complete"),
          ]
        : [
            executionConnection("start", "require"),
            executionConnection("require", "transfer"),
            executionConnection("transfer", "complete"),
          ];
      setFeedback(
        isDefaultOrder
          ? "Execution flow rewired: Start Request → Transfer Item → Require Item → Complete Request."
          : "Execution flow rewired: Start Request → Require Item → Transfer Item → Complete Request."
      );
      return [...nextExec, ...valueEdges];
    });
  }

  function resetStarterFlow() {
    setConnections(initialConnections());
    setValues({ CONSTANT_A: "10", CONSTANT_B: "40" });
    setCustomNames({ CONSTANT_A: "CONSTANT_A", CONSTANT_B: "CONSTANT_B" });
    setCustomTypes({ CONSTANT_A: "u64", CONSTANT_B: "u64" });
    setSelection(null);
    setHoveredNodeId(null);
    setLayout(initialNodes);
    setFeedback("Reset to default starter flow with clean non-overlapping layout.");
  }

  const nodes = layout.map(node => {
    const op = operations.find(entry => entry.id === node.id);
    const connected = op
      ? connections.some(edge => edge.target === node.id && edge.targetHandle === "quantity")
      : connections.some(edge => edge.source === node.id && edge.sourceHandle === "value");
    const execInConnected = connections.some(edge => edge.target === node.id && edge.targetHandle === "exec-in");
    const execOutConnected = connections.some(edge => edge.source === node.id && edge.sourceHandle === "exec-out");

    const isDirectlyActive = node.id === activeId;
    const isConnected = Boolean(
      activeId &&
      connections.some(e =>
        (e.source === activeId && e.target === node.id) ||
        (e.target === activeId && e.source === node.id)
      )
    );

    return {
      ...node,
      deletable: false,
      data: {
        role: op?.role,
        item: op?.item,
        name: customNames[node.id],
        dataType: customTypes[node.id],
        value: values[node.id],
        connected,
        execInConnected,
        execOutConnected,
        selected: isDirectlyActive,
        highlighted: isConnected,
        edit: (text: string) => setValues(current => ({ ...current, [node.id]: text })),
        onNameChange: (newName: string) => updateConstantName(node.id, newName),
        onTypeChange: (newType: SocketType) => updateConstantType(node.id, newType),
      },
    };
  });

  const edges: Edge[] = connections.map(edge => {
    const isExec = edge.sourceHandle === "exec-out" && edge.targetHandle === "exec-in";
    const isTraced = Boolean(
      activeId && (edge.source === activeId || edge.target === activeId)
    );

    return {
      ...edge,
      id: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`,
      type: isExec ? "smoothstep" : "default",
      className: `${isExec ? styles.executionEdge : styles.u64Edge}${isTraced ? ` ${styles.tracedEdge}` : ""}`,
      animated: isTraced,
      selected: isTraced,
      deletable: true,
      reconnectable: false,
      markerEnd: isExec
        ? {
            type: MarkerType.ArrowClosed,
            color: isTraced ? "var(--socket-execution)" : "var(--socket-execution)",
          }
        : undefined,
      ariaLabel: isExec
        ? `${edge.source} to ${edge.target} execution request${isTraced ? " (connected)" : ""}`
        : `${edge.source} to ${edge.target} u64 quantity${isTraced ? " (connected)" : ""}`,
    };
  });

  const execSummary = traceExecutionFlow(connections);

  const activeTraceNotice = useMemo(() => {
    if (!activeId) return null;
    if (constantNames.some(name => name === activeId)) {
      const consumers = connections
        .filter(e => e.source === activeId && e.sourceHandle === "value")
        .map(e => operations.find(o => o.id === e.target)?.role ?? e.target);
      return consumers.length > 0
        ? `${activeId} (u64): feeds ${consumers.join(", ")} · wire illuminated.`
        : `${activeId} (u64): currently unconnected.`;
    }
    const op = operations.find(o => o.id === activeId);
    const sourceNode = connections.find(e => e.target === activeId && e.targetHandle === "quantity")?.source;
    if (sourceNode) {
      return `${op?.role ?? activeId}: quantity supplied by ${sourceNode} · connected wires illuminated.`;
    }
    return `${op?.role ?? activeId}: linear execution flow illuminated.`;
  }, [activeId, connections]);

  const canvasElement = (
    <div className={styles.canvas}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.35}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={changes =>
          setLayout(current => applyNodeChanges(changes.filter(change => change.type !== "remove"), current))
        }
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onNodeClick={(_, node) => {
          if (
            constantNames.some(name => name === node.id) ||
            operations.some(op => op.id === node.id)
          ) {
            setSelection(current => (current === node.id ? null : node.id));
          }
        }}
        onPaneClick={() => setSelection(null)}
        onConnect={connect}
        isValidConnection={connection =>
          connectionError(
            {
              ...connection,
              sourceHandle: connection.sourceHandle ?? null,
              targetHandle: connection.targetHandle ?? null,
            },
            connections,
            customTypes
          ) === null
        }
        onConnectEnd={(_, state) => {
          if (!state.isValid && state.fromNode && state.toNode) {
            const attempt = {
              source: state.fromNode.id,
              target: state.toNode.id,
              sourceHandle: state.fromHandle?.id ?? null,
              targetHandle: state.toHandle?.id ?? null,
            };
            setFeedback(connectionError(attempt, connections, customTypes) ?? "Connect matching socket types.");
          } else if (!state.isValid) {
            setFeedback("Connection not made. Connect matching socket types (exec → exec or u64 → u64).");
          }
        }}
        onEdgesChange={changes => {
          for (const change of changes) {
            if (change.type === "remove") {
              const edge = edges.find(entry => entry.id === change.id);
              if (edge?.targetHandle === "quantity" || edge?.targetHandle === "exec-in") {
                disconnect(edge.target, edge.targetHandle);
              }
            }
          }
        }}
        edgesReconnectable={false}
        deleteKeyCode={["Backspace", "Delete"]}
        aria-label="Illustrative Move primitive wiring canvas"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--color-line)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={node => {
            if (!node.data.role) {
              const t = node.data.dataType ?? "u64";
              return `var(--socket-${t})`;
            }
            if (node.data.role === "Start Request" || node.data.role === "Complete Request")
              return "var(--socket-execution)";
            return "var(--socket-item)";
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
        <Panel position="top-left">
          <div className={styles.canvasBadge}>
            <span className={styles.canvasPulse} aria-hidden="true" />
            ReactFlow Interactive Canvas
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );

  if (canvasOnly) {
    return canvasElement;
  }

  return (
    <div className={styles.preview}>
      <h2 className="text-step-1">Typed Move/SDK Primitives &amp; Wireable Execution Flow</h2>
      <p>
        Working ReactFlow example. Move/SDK primitives (<code>entity::start_request</code>,{" "}
        <code>inventory::require_item</code>, <code>inventory::transfer_item</code>,{" "}
        <code>request::complete_request</code>) with colour-coded typed sockets. Hover over any block
        to inspect its connections and partner blocks. Click to pin Move source inspection.
      </p>

      <div className={styles.legend} aria-label="Socket type legend">
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchExecution}`}>▸ exec</span>
          Linear Request flow (dashed arrow)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchU64}`}>● u64</span>
          Copyable u64 integer (solid line)
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchItem}`}>◆ item</span>
          Item / Entity fixture
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.swatchBoolean}`}>▲ bool</span>
          Boolean predicate
        </span>
      </div>

      {canvasElement}

      {showControls && (
        <div className={styles.controlGrid}>
          <fieldset className={styles.controls}>
            <legend>u64 Value connections · keyboard or pointer</legend>
            <label>
              Primitive Constant
              <select value={source} onChange={event => setSource(event.target.value)}>
                {constantNames.map(name => (
                  <option key={name} value={name}>{customNames[name] ?? name}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity input
              <select value={target} onChange={event => setTarget(event.target.value)}>
                <option value="require">Require Item (FERAL_DATA) · u64 in</option>
                <option value="transfer">Transfer Item (EU_40) · u64 in</option>
              </select>
            </label>
            <Button onClick={() => connect(valueConnection(source, target))}>Connect u64</Button>
            <Button variant="secondary" onClick={() => disconnect(target, "quantity")}>
              Disconnect u64
            </Button>
          </fieldset>

          <fieldset className={styles.controls}>
            <legend>Execution flow · linear Request order</legend>
            <label>
              Request out
              <select value={execSource} onChange={event => setExecSource(event.target.value)}>
                {executionSourceIds.map(id => (
                  <option key={id} value={id}>
                    {operations.find(op => op.id === id)?.role} ({id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Request in
              <select value={execTarget} onChange={event => setExecTarget(event.target.value)}>
                {executionTargetIds.map(id => (
                  <option key={id} value={id}>
                    {operations.find(op => op.id === id)?.role} ({id})
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={() => connect(executionConnection(execSource, execTarget))}>
              Connect exec
            </Button>
            <Button variant="secondary" onClick={() => disconnect(execTarget, "exec-in")}>
              Disconnect exec
            </Button>
            <Button variant="secondary" onClick={swapExecutionOrder}>
              Swap Order
            </Button>
            <Button variant="secondary" onClick={resetStarterFlow}>
              Reset Flow
            </Button>
          </fieldset>
        </div>
      )}

      <p role="status">
        {feedback}
        {activeTraceNotice && <strong style={{ display: "block", marginTop: "4px" }}>{activeTraceNotice}</strong>}
      </p>
      <ul>
        <li>
          Execution chain: {execSummary.steps.join(" → ")}{" "}
          {execSummary.error ? `(incomplete: ${execSummary.error})` : "(complete)"}
        </li>
        {consumerIds.map(id => (
          <li key={id}>
            {id} quantity:{" "}
            {connections.find(edge => edge.target === id && edge.targetHandle === "quantity")?.source
              ? customNames[connections.find(edge => edge.target === id && edge.targetHandle === "quantity")!.source] ??
                connections.find(edge => edge.target === id && edge.targetHandle === "quantity")!.source
              : "Unconnected"}
          </li>
        ))}
      </ul>
      {showCodePreview && (
        <SourcePreview
          values={values}
          connections={connections}
          selection={activeId}
          customNames={customNames}
          customTypes={customTypes}
        />
      )}
      <p>
        Zero is valid u64 here, not a promise of valid exercise payment. No wallet, RPC, inventory enforcement or compiler.
      </p>
    </div>
  );
}
