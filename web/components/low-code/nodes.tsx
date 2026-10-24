"use client";

import { useId, useState, useMemo, useRef, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Plate } from "@/components/ui/plate";
import { cn } from "@/lib/cn";
import { socketTypeMeta, type SocketType } from "./connections.mjs";
import { validateU64 } from "./u64.mjs";
import styles from "./nodes.module.css";

export const itemCatalog = [
  { id: "STORAGE_UNIT", name: "Storage Unit", category: "Structure Fixture", description: "Target entity container for item exchange" },
  { id: "FERAL_DATA", name: "Feral Data", category: "Raw Intel", description: "Unsanitized encrypted sensor data capsule" },
  { id: "EU_40", name: "EU-40 Fuel", category: "Volatile Fuel", description: "Standard refined 40-unit propulsion isotope" },
  { id: "D1_FUEL", name: "D1 Fuel", category: "Propellant", description: "Deuterium grade-1 sub-light propulsion propellant" },
  { id: "D2_FUEL", name: "D2 Fuel", category: "Propellant", description: "Enriched deuterium grade-2 high-impulse fuel" },
  { id: "STRANGERS_HEAD", name: "Strangers Head", category: "Salvage Artifact", description: "Preserved cybernetic cranial module of unknown origin" },
] as const;

function ItemSearchDialog({
  open,
  onOpenChange,
  currentValue,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValue: string;
  onSelect: (itemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return itemCatalog;
    return itemCatalog.filter(
      item =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.dialogBackdrop} />
        <Dialog.Popup
          className={styles.dialogPopup}
          initialFocus={inputRef}
          aria-label="Select Item Type"
        >
          <Plate className={styles.dialogSurface}>
            <div className={styles.dialogHeader}>
              <div>
                <Dialog.Title className={styles.dialogTitle}>Select Item Type</Dialog.Title>
                <Dialog.Description className={styles.dialogDescription}>
                  Search and pick a known Move item or entity type identifier.
                </Dialog.Description>
              </div>
              <Dialog.Close className={styles.dialogCloseBtn} aria-label="Close dialog">
                ✕
              </Dialog.Close>
            </div>

            <div className={styles.dialogSearchWrapper}>
              <input
                ref={inputRef}
                className={styles.dialogSearchInput}
                type="search"
                placeholder="Search by ID, name, or category (e.g. EU_40, Feral, Fuel)..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search item types"
              />
            </div>

            <div className={styles.dialogList} role="listbox" aria-label="Available item types">
              {filtered.length === 0 ? (
                <div className={styles.dialogEmpty}>
                  No items match &ldquo;{query}&rdquo;.
                  <button
                    type="button"
                    className={styles.dialogCustomBtn}
                    onClick={() => {
                      const customId = query.trim().toUpperCase().replace(/\s+/g, "_");
                      if (customId) {
                        onSelect(customId);
                        onOpenChange(false);
                      }
                    }}
                  >
                    Use custom identifier &ldquo;{query.trim().toUpperCase().replace(/\s+/g, "_")}&rdquo;
                  </button>
                </div>
              ) : (
                filtered.map(item => {
                  const isSelected = item.id.toUpperCase() === currentValue.toUpperCase();
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(styles.dialogItemBtn, isSelected && styles.dialogItemActive)}
                      onClick={() => {
                        onSelect(item.id);
                        onOpenChange(false);
                      }}
                    >
                      <div className={styles.dialogItemMain}>
                        <span className={styles.dialogItemId}>
                          <span className={styles.itemGlyph} aria-hidden="true">◆</span> {item.id}
                        </span>
                        <span className={styles.dialogItemName}>{item.name}</span>
                      </div>
                      <div className={styles.dialogItemMeta}>
                        <span className={styles.dialogItemCategory}>{item.category}</span>
                        <span className={styles.dialogItemDesc}>{item.description}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className={styles.dialogFooter}>
              <span className={styles.dialogTip}>
                Press <kbd>Esc</kbd> or click ✕ to cancel
              </span>
            </div>
          </Plate>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const operationRoles = [
  "Start Request",
  "Require Item",
  "Transfer Item",
  "Assert Condition",
  "Complete Request",
] as const;
export type OperationRole = (typeof operationRoles)[number];

export type OperationHandleId = "exec-in" | "exec-out" | "item" | "quantity" | "condition";

const primitiveSpec: Record<OperationRole, {
  symbol: string;
  summary: string;
  accent: SocketType;
  defaultItem?: string;
  hasExecIn: boolean;
  hasExecOut: boolean;
  valueInput?: { id: "quantity" | "condition"; type: SocketType; label: string };
}> = {
  "Start Request": {
    symbol: "entity::start_request",
    summary: "Open a linear Request on the target entity.",
    accent: "execution",
    hasExecIn: false,
    hasExecOut: true,
  },
  "Require Item": {
    symbol: "inventory::require_item",
    summary: "Enforce exact item deposit into the active Request.",
    accent: "item",
    defaultItem: "FERAL_DATA",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "quantity", type: "u64", label: "Quantity in" },
  },
  "Transfer Item": {
    symbol: "inventory::transfer_item",
    summary: "Withdraw and route item quantity in the active Request.",
    accent: "item",
    defaultItem: "EU_40",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "quantity", type: "u64", label: "Quantity in" },
  },
  "Assert Condition": {
    symbol: "assert!",
    summary: "Abort the Request unless the boolean predicate holds.",
    accent: "boolean",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "condition", type: "boolean", label: "Condition in" },
  },
  "Complete Request": {
    symbol: "request::complete_request",
    summary: "Consume the linear Request after all requirements pass.",
    accent: "execution",
    hasExecIn: true,
    hasExecOut: false,
  },
};

export function socketPortClassName({
  direction,
  type = "u64",
  connected = false,
}: {
  direction: "in" | "out";
  type?: SocketType;
  connected?: boolean;
}) {
  return cn(styles.port, styles[direction], styles[type], connected && styles.portConnected);
}

export function Socket({
  direction,
  type = "u64",
  label,
  binding,
  connected = false,
  handle,
}: {
  direction: "in" | "out";
  type?: SocketType;
  label?: string;
  binding?: string;
  connected?: boolean;
  handle?: ReactNode;
}) {
  const meta = socketTypeMeta[type];

  return (
    <div className={cn(styles.socket, direction === "out" && styles.socketOut, styles[type])}>
      {handle ?? (
        <span
          aria-hidden="true"
          className={socketPortClassName({ direction, type, connected })}
        />
      )}
      <span className={styles.socketMain}>
        <span className={styles.typeBadge}>
          <span aria-hidden="true">{meta.glyph}</span> {meta.badge}
        </span>
        {label && <span className={styles.socketName}>{label}</span>}
      </span>
      {binding && (
        <span className={cn(styles.socketMeta, styles.socketMetaConnected)}>
          {binding}
        </span>
      )}
    </div>
  );
}

function NodeShell({
  title,
  category,
  accentType = "execution",
  selected,
  highlighted,
  invalid,
  headerContent,
  children,
  ports,
}: {
  title?: string;
  category?: string;
  accentType?: SocketType;
  selected?: boolean;
  highlighted?: boolean;
  invalid?: boolean;
  headerContent?: ReactNode;
  children: ReactNode;
  ports?: ReactNode;
}) {
  return (
    <section
      className={cn(
        styles.node,
        selected && styles.selected,
        highlighted && !selected && styles.highlighted,
        invalid && styles.invalid
      )}
      data-accent={accentType}
      aria-label={title}
    >
      <Plate className={styles.ring} aria-hidden="true">
        <Plate className={styles.surface} />
      </Plate>
      <div className={styles.content}>
        {headerContent ?? (
          <header className={styles.header}>
            <div>
              {category && <div className={styles.eyebrow}>{category}</div>}
              {title && <div className={styles.heading}>{title}</div>}
            </div>
          </header>
        )}
        {children}
      </div>
      {ports}
    </section>
  );
}

const editableTypes: SocketType[] = ["u64", "boolean", "item"];

function validateConstantValue(type: SocketType, value: string): { error: string | null; hint: string } {
  if (type === "u64") {
    const res = validateU64(value);
    return {
      error: res.error,
      hint: "Copyable value · zero is valid u64",
    };
  }
  if (type === "boolean") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed !== "true" && trimmed !== "false") {
      return {
        error: "Boolean must be 'true' or 'false'",
        hint: "Literal boolean signal · true | false",
      };
    }
    return {
      error: null,
      hint: "Literal boolean signal · true | false",
    };
  }
  if (type === "item") {
    const trimmed = value.trim();
    if (!trimmed) {
      return {
        error: "Item identifier cannot be empty",
        hint: "Move Item/Entity identifier (e.g. FERAL_DATA)",
      };
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
      return {
        error: "Must be a valid identifier (alphanumeric and underscore)",
        hint: "Move Item/Entity identifier (e.g. FERAL_DATA)",
      };
    }
    return {
      error: null,
      hint: "Move Item/Entity identifier (e.g. FERAL_DATA)",
    };
  }
  return { error: null, hint: `Literal ${type} constant` };
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H2.5v-2.5L11.5 2.5z" />
    </svg>
  );
}

export function PrimitiveConstant({
  name = "CONSTANT_A",
  dataType = "u64",
  value,
  onChange,
  onNameChange,
  onTypeChange,
  selected,
  highlighted,
  connected,
  handle,
  ports,
}: {
  name?: string;
  dataType?: SocketType;
  value: string;
  onChange: (text: string) => void;
  onNameChange?: (name: string) => void;
  onTypeChange?: (type: SocketType) => void;
  selected?: boolean;
  highlighted?: boolean;
  connected?: boolean;
  handle?: ReactNode;
  ports?: ReactNode;
}) {
  const id = useId();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);

  const [isEditingType, setIsEditingType] = useState(false);

  const [isEditingValue, setIsEditingValue] = useState(false);
  const [valueDraft, setValueDraft] = useState(value);

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const { error } = validateConstantValue(dataType, isEditingValue ? valueDraft : value);
  const meta = socketTypeMeta[dataType];

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== name) {
      onNameChange?.(trimmed);
    } else {
      setNameDraft(name);
    }
    setIsEditingName(false);
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitName();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNameDraft(name);
      setIsEditingName(false);
    }
  }

  function commitValue() {
    onChange(valueDraft);
    setIsEditingValue(false);
  }

  function handleValueKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValueDraft(value);
      setIsEditingValue(false);
    }
  }

  function selectType(t: SocketType) {
    onTypeChange?.(t);
    if (t === "boolean") {
      const lower = value.trim().toLowerCase();
      if (lower !== "true" && lower !== "false") {
        onChange("true");
        setValueDraft("true");
      }
    } else if (t === "item") {
      const trimmed = value.trim();
      if (!trimmed || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
        onChange("STORAGE_UNIT");
        setValueDraft("STORAGE_UNIT");
      }
    }
    setIsEditingType(false);
  }

  const placeholder =
    dataType === "u64"
      ? "Decimal u64 (e.g. 40)"
      : dataType === "boolean"
      ? "true or false"
      : dataType === "item"
      ? "Item ID (e.g. EU_40)"
      : `Value`;

  const headerContent = (
    <header className={styles.header}>
      <div>
        <div className={styles.eyebrow}>Primitive Constant</div>
      </div>
    </header>
  );

  return (
    <>
      <NodeShell
        title={name}
        accentType={dataType}
        selected={selected}
        highlighted={highlighted}
        invalid={!!error}
        headerContent={headerContent}
        ports={ports}
      >
        <div className={cn(styles.propertiesList, "nodrag nopan")}>
          {/* Row 1: Name */}
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Name:</span>
            <div className={styles.propContent}>
              {isEditingName ? (
                <div className={styles.inlineEditForm}>
                  <input
                    className={styles.inlineInput}
                    value={nameDraft}
                    autoFocus
                    onChange={e => setNameDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={handleNameKeyDown}
                    aria-label="Edit constant name"
                  />
                  <button
                    type="button"
                    className={styles.inlineSaveBtn}
                    onMouseDown={e => {
                      e.preventDefault();
                      commitName();
                    }}
                    title="Save name"
                    aria-label="Save name"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className={styles.propValueWrapper}>
                  <span className={styles.propValueText} title={name}>
                    {name}
                  </span>
                  <button
                    type="button"
                    className={styles.inlineEditBtn}
                    onClick={() => {
                      setNameDraft(name);
                      setIsEditingName(true);
                    }}
                    title="Edit name"
                    aria-label={`Edit name for ${name}`}
                  >
                    <EditIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Type */}
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Type:</span>
            <div className={styles.propContent}>
              {isEditingType ? (
                <div className={styles.inlineTypePicker}>
                  {editableTypes.map(t => {
                    const m = socketTypeMeta[t];
                    const isCurrent = t === dataType;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={cn(styles.typeOptionBtn, isCurrent && styles.typeOptionActive)}
                        onClick={() => selectType(t)}
                      >
                        <span aria-hidden="true">{m.glyph}</span> {m.badge}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className={styles.inlineCancelBtn}
                    onClick={() => setIsEditingType(false)}
                    title="Close type picker"
                    aria-label="Close type picker"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className={styles.propValueWrapper}>
                  <span className={styles.typeBadge}>
                    <span aria-hidden="true">{meta.glyph}</span> {meta.badge}
                  </span>
                  <button
                    type="button"
                    className={styles.inlineEditBtn}
                    onClick={() => setIsEditingType(true)}
                    title="Edit type"
                    aria-label={`Edit type (currently ${dataType})`}
                  >
                    <EditIcon />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Value */}
          <div className={styles.propRow}>
            <span className={styles.propLabel}>Value:</span>
            <div className={styles.propContent}>
              {dataType === "boolean" ? (
                isEditingValue ? (
                  <div className={styles.inlineTypePicker}>
                    <button
                      type="button"
                      className={cn(
                        styles.typeOptionBtn,
                        valueDraft.toLowerCase() === "true" && styles.typeOptionActive
                      )}
                      onClick={() => {
                        onChange("true");
                        setValueDraft("true");
                        setIsEditingValue(false);
                      }}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      className={cn(
                        styles.typeOptionBtn,
                        valueDraft.toLowerCase() === "false" && styles.typeOptionActive
                      )}
                      onClick={() => {
                        onChange("false");
                        setValueDraft("false");
                        setIsEditingValue(false);
                      }}
                    >
                      False
                    </button>
                    <button
                      type="button"
                      className={styles.inlineCancelBtn}
                      onClick={() => setIsEditingValue(false)}
                      title="Close boolean selector"
                      aria-label="Close boolean selector"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={styles.propValueWrapper}>
                    <span className={styles.propValueText} title={value}>
                      {value.toLowerCase() === "true" ? "True" : "False"}
                    </span>
                    <button
                      type="button"
                      className={styles.inlineEditBtn}
                      onClick={() => {
                        setValueDraft(value.toLowerCase() === "true" ? "true" : "false");
                        setIsEditingValue(true);
                      }}
                      title="Edit boolean value"
                      aria-label={`Edit boolean value (currently ${value})`}
                    >
                      <EditIcon />
                    </button>
                  </div>
                )
              ) : dataType === "item" ? (
                <div className={styles.propValueWrapper}>
                  <span className={styles.propValueText} title={value || "Select item..."}>
                    {value || "Select item..."}
                  </span>
                  <button
                    type="button"
                    className={styles.inlineEditBtn}
                    onClick={() => setIsItemDialogOpen(true)}
                    title="Search and select item type"
                    aria-label={`Select item type (currently ${value || "none"})`}
                  >
                    <EditIcon />
                  </button>
                </div>
              ) : isEditingValue ? (
                <div className={styles.inlineEditForm}>
                  <input
                    className={styles.inlineInput}
                    type="text"
                    inputMode={dataType === "u64" ? "numeric" : "text"}
                    placeholder={placeholder}
                    value={valueDraft}
                    autoFocus
                    onChange={e => setValueDraft(e.target.value)}
                    onBlur={commitValue}
                    onKeyDown={handleValueKeyDown}
                    aria-label="Edit constant value"
                  />
                  <button
                    type="button"
                    className={styles.inlineSaveBtn}
                    onMouseDown={e => {
                      e.preventDefault();
                      commitValue();
                    }}
                    title="Save value"
                    aria-label="Save value"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className={styles.propValueWrapper}>
                  <span
                    className={cn(styles.propValueText, !value && styles.propPlaceholder)}
                    title={value || placeholder}
                  >
                    {value || placeholder}
                  </span>
                  <button
                    type="button"
                    className={styles.inlineEditBtn}
                    onClick={() => {
                      setValueDraft(value);
                      setIsEditingValue(true);
                    }}
                    title="Edit value"
                    aria-label={`Edit value for ${name}`}
                  >
                    <EditIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p id={id} className={styles.error}>
            {"Error: " + error}
          </p>
        )}

        <div className={styles.sockets}>
          <Socket
            direction="out"
            type={dataType}
            connected={connected}
            handle={handle}
          />
        </div>
      </NodeShell>

      <ItemSearchDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        currentValue={value}
        onSelect={itemId => {
          onChange(itemId);
          setValueDraft(itemId);
        }}
      />
    </>
  );
}

export function OperationNode({
  role,
  item,
  connected = false,
  execInConnected = true,
  execOutConnected = true,
  selected,
  highlighted,
  handles,
  ports,
}: {
  role: OperationRole;
  item?: string;
  connected?: boolean;
  execInConnected?: boolean;
  execOutConnected?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  handles?: Partial<Record<OperationHandleId, ReactNode>>;
  ports?: ReactNode;
}) {
  const spec = primitiveSpec[role];
  const resolvedItem = item ?? spec.defaultItem;

  return (
    <NodeShell
      title={role}
      category={spec.symbol}
      accentType={spec.accent}
      selected={selected}
      highlighted={highlighted}
      ports={ports}
    >
      <p className={styles.hint}>{spec.summary}</p>
      <div className={styles.sockets}>
        {spec.valueInput && (
          <Socket
            direction="in"
            type={spec.valueInput.type}
            label={spec.valueInput.label}
            connected={connected}
            handle={handles?.[spec.valueInput.id]}
          />
        )}
        {resolvedItem && role !== "Start Request" && (
          <Socket
            direction="in"
            type="item"
            label="Item type"
            binding={resolvedItem}
            connected={true}
            handle={handles?.item}
          />
        )}
        {spec.hasExecIn && (
          <Socket
            direction="in"
            type="execution"
            label="Request in"
            connected={execInConnected}
            handle={handles?.["exec-in"]}
          />
        )}
        {spec.hasExecOut && (
          <Socket
            direction="out"
            type="execution"
            label="Request out"
            connected={execOutConnected}
            handle={handles?.["exec-out"]}
          />
        )}
      </div>
    </NodeShell>
  );
}
