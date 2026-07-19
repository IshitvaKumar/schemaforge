"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Connection,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Copy,
  Database,
  Download,
  KeyRound,
  Link2,
  Plus,
  RotateCcw,
  Sparkles,
  Table2,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  Column,
  ecommerceSample,
  freshWorkspace,
  postgresSql,
  SchemaTable,
  STORAGE_KEY,
  validateWorkspace,
  Workspace,
} from "./schema";

const FIELD_TYPES = ["uuid", "bigint", "integer", "serial", "varchar(255)", "text", "boolean", "date", "timestamptz", "numeric(10,2)", "jsonb"];

type TableNodeData = {
  table: SchemaTable;
  foreignColumnIds: Set<string>;
  onTableNameChange: (tableId: string, value: string) => void;
  onColumnChange: (tableId: string, columnId: string, changes: Partial<Column>) => void;
  onAddColumn: (tableId: string) => void;
  onDeleteColumn: (tableId: string, columnId: string) => void;
  onDeleteTable: (tableId: string) => void;
};

type RelationDraft = {
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
};

function SchemaTableNode({ data: rawData }: NodeProps) {
  const data = rawData as unknown as TableNodeData;
  const { table } = data;

  return (
    <div className="w-[290px] overflow-hidden rounded-2xl border border-slate-700/70 bg-[#101827]/95 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-slate-700/70 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent px-3 py-2.5">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/20 text-indigo-300">
          <Table2 size={15} />
        </div>
        <input
          aria-label="Table name"
          className="nodrag min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-100 outline-none placeholder:text-slate-500"
          value={table.name}
          placeholder="table_name"
          onChange={(event) => data.onTableNameChange(table.id, event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
        />
        <button
          className="nodrag grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300"
          title="Delete table"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => data.onDeleteTable(table.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="py-1.5">
        {table.columns.map((field) => {
          const isForeignKey = data.foreignColumnIds.has(field.id);
          return (
            <div key={field.id} className="group relative grid grid-cols-[1fr_92px_28px_22px] items-center gap-1.5 px-3 py-1.5 hover:bg-white/[0.035]">
              <Handle
                type="target"
                id={`target-${field.id}`}
                position={Position.Left}
                className="!h-4 !w-4 !border-2 !border-[#101827] !bg-violet-400 !shadow-[0_0_0_2px_rgba(167,139,250,0.2)]"
                title="Reference target — drop a foreign key here"
              />
              <Handle
                type="source"
                id={`source-${field.id}`}
                position={Position.Right}
                className={`!h-4 !w-4 !border-2 !border-[#101827] !shadow-[0_0_0_2px_rgba(34,211,238,0.16)] ${isForeignKey ? "!bg-amber-400" : "!bg-cyan-400"}`}
                title="Foreign-key source — drag this onto a primary key"
              />
              <input
                aria-label={`${table.name} column name`}
                className="nodrag min-w-0 bg-transparent text-xs font-medium text-slate-200 outline-none placeholder:text-slate-600"
                value={field.name}
                placeholder="column_name"
                onChange={(event) => data.onColumnChange(table.id, field.id, { name: event.target.value })}
                onMouseDown={(event) => event.stopPropagation()}
              />
              <select
                aria-label={`${field.name} type`}
                className="nodrag cursor-pointer appearance-none rounded-md border border-slate-700/70 bg-slate-900/75 px-1.5 py-1 text-[10px] font-semibold text-slate-400 outline-none focus:border-indigo-400"
                value={field.type}
                onChange={(event) => data.onColumnChange(table.id, field.id, { type: event.target.value })}
                onMouseDown={(event) => event.stopPropagation()}
              >
                {!FIELD_TYPES.includes(field.type) && <option value={field.type}>{field.type}</option>}
                {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <button
                className={`nodrag grid h-6 w-6 place-items-center rounded-md transition ${field.primaryKey ? "bg-amber-400/20 text-amber-300" : isForeignKey ? "bg-violet-400/15 text-violet-300" : "text-slate-600 hover:bg-slate-700/60 hover:text-slate-300"}`}
                title={field.primaryKey ? "Primary key — click to remove" : isForeignKey ? "Foreign key — drag its blue handle to a primary key" : "Mark as primary key"}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => data.onColumnChange(table.id, field.id, { primaryKey: !field.primaryKey })}
              >
                {field.primaryKey ? <KeyRound size={12} /> : isForeignKey ? <Link2 size={12} /> : <KeyRound size={12} />}
              </button>
              <button
                className="nodrag grid h-5 w-5 place-items-center rounded text-slate-700 opacity-0 transition hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                title="Delete field"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => data.onDeleteColumn(table.id, field.id)}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="nodrag flex w-full items-center gap-1.5 border-t border-slate-700/60 px-3 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-indigo-400/10 hover:text-indigo-200"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => data.onAddColumn(table.id)}
      >
        <Plus size={14} /> Add field
      </button>
    </div>
  );
}

const nodeTypes = { schemaTable: SchemaTableNode };

function makeId(prefix: string) {
  return `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString(36)}`;
}

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>(() => ecommerceSample());
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState("Loading workspace…");
  const [notice, setNotice] = useState("Drag a blue field handle onto a primary key to create a relationship.");
  const [copyLabel, setCopyLabel] = useState("Copy SQL");
  const [relationDraft, setRelationDraft] = useState<RelationDraft>({ sourceTableId: "", sourceColumnId: "", targetTableId: "", targetColumnId: "" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Workspace;
        if (parsed.tables && parsed.relations) setWorkspace(parsed);
      }
      setSaveState("Saved locally");
    } catch {
      setSaveState("Local save unavailable");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      setSaveState("Saved locally");
    } catch {
      setSaveState("Local save unavailable");
    }
  }, [workspace, hydrated]);

  const updateTable = useCallback((tableId: string, update: (table: SchemaTable) => SchemaTable) => {
    setWorkspace((current) => ({ ...current, tables: current.tables.map((table) => table.id === tableId ? update(table) : table) }));
  }, []);

  const onTableNameChange = useCallback((tableId: string, name: string) => {
    updateTable(tableId, (table) => ({ ...table, name }));
  }, [updateTable]);

  const onColumnChange = useCallback((tableId: string, columnId: string, changes: Partial<Column>) => {
    updateTable(tableId, (table) => ({
      ...table,
      columns: table.columns.map((field) => field.id === columnId ? { ...field, ...changes } : field),
    }));
  }, [updateTable]);

  const onAddColumn = useCallback((tableId: string) => {
    updateTable(tableId, (table) => ({
      ...table,
      columns: [...table.columns, { id: makeId("column"), name: "new_field", type: "text", primaryKey: false, nullable: false }],
    }));
  }, [updateTable]);

  const onDeleteColumn = useCallback((tableId: string, columnId: string) => {
    setWorkspace((current) => ({
      ...current,
      tables: current.tables.map((table) => table.id === tableId ? { ...table, columns: table.columns.filter((field) => field.id !== columnId) } : table),
      relations: current.relations.filter((relation) => !((relation.source === tableId && relation.sourceColumnId === columnId) || (relation.target === tableId && relation.targetColumnId === columnId))),
    }));
  }, []);

  const onDeleteTable = useCallback((tableId: string) => {
    setWorkspace((current) => ({
      ...current,
      tables: current.tables.filter((table) => table.id !== tableId),
      relations: current.relations.filter((relation) => relation.source !== tableId && relation.target !== tableId),
    }));
  }, []);

  const addTable = useCallback(() => {
    setWorkspace((current) => {
      const tableNumber = current.tables.length + 1;
      const tableId = makeId("table");
      return {
        ...current,
        tables: [...current.tables, {
          id: tableId,
          name: `table_${tableNumber}`,
          position: { x: 180 + (tableNumber % 3) * 250, y: 180 + (tableNumber % 4) * 135 },
          columns: [{ id: makeId("column"), name: "id", type: "uuid", primaryKey: true, nullable: false }],
        }],
      };
    });
    setNotice("New table added. Rename it and add the fields you need.");
  }, []);

  const createRelationship = useCallback((sourceId: string, sourceColumnId: string, targetId: string, targetColumnId: string) => {
    if (sourceId === targetId) {
      setNotice("Choose a different table for this foreign-key relationship.");
      return;
    }
    setWorkspace((current) => {
      const source = current.tables.find((table) => table.id === sourceId);
      const target = current.tables.find((table) => table.id === targetId);
      const sourceColumn = source?.columns.find((field) => field.id === sourceColumnId);
      const targetColumn = target?.columns.find((field) => field.id === targetColumnId);
      if (!source || !target || !sourceColumn || !targetColumn) return current;
      if (!targetColumn.primaryKey) {
        setNotice(`${target.name}.${targetColumn.name} must be marked as a primary key before it can be referenced.`);
        return current;
      }
      if (current.relations.some((relation) => relation.source === source.id && relation.sourceColumnId === sourceColumn.id)) {
        setNotice(`${source.name}.${sourceColumn.name} already has a foreign-key relationship. Delete it first to reconnect.`);
        return current;
      }
      setNotice(`Relationship created: ${source.name}.${sourceColumn.name} → ${target.name}.${targetColumn.name}`);
      return {
        ...current,
        relations: [...current.relations, {
          id: makeId("relation"),
          source: source.id,
          sourceColumnId,
          target: target.id,
          targetColumnId,
        }],
      };
    });
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return;
    createRelationship(
      connection.source,
      connection.sourceHandle.replace("source-", ""),
      connection.target,
      connection.targetHandle.replace("target-", ""),
    );
  }, [createRelationship]);

  const onNodesChange = useCallback((changes: any[]) => {
    const moved = changes.filter((change) => change.type === "position" && change.position);
    if (!moved.length) return;
    setWorkspace((current) => ({
      ...current,
      tables: current.tables.map((table) => {
        const change = moved.find((item: { id: string }) => item.id === table.id);
        return change ? { ...table, position: change.position } : table;
      }),
    }));
  }, []);

  const onEdgesDelete = useCallback((deleted: Array<{ id: string }>) => {
    if (!deleted.length) return;
    setWorkspace((current) => ({ ...current, relations: current.relations.filter((relation) => !deleted.some((edge) => edge.id === relation.id)) }));
    setNotice("Relationship removed.");
  }, []);

  const foreignColumnIds = useMemo(() => new Set(workspace.relations.map((relation) => relation.sourceColumnId)), [workspace.relations]);
  const draftSourceTable = workspace.tables.find((table) => table.id === relationDraft.sourceTableId);
  const draftTargetTable = workspace.tables.find((table) => table.id === relationDraft.targetTableId);
  const availableSourceColumns = draftSourceTable?.columns.filter((field) => !foreignColumnIds.has(field.id)) ?? [];
  const availableTargetColumns = draftTargetTable?.columns.filter((field) => field.primaryKey) ?? [];
  const canCreateRelationship = Boolean(
    relationDraft.sourceTableId && relationDraft.sourceColumnId && relationDraft.targetTableId && relationDraft.targetColumnId,
  );
  const nodes = useMemo(() => workspace.tables.map((table) => ({
    id: table.id,
    type: "schemaTable",
    position: table.position,
    data: { table, foreignColumnIds, onTableNameChange, onColumnChange, onAddColumn, onDeleteColumn, onDeleteTable },
  })), [workspace.tables, foreignColumnIds, onTableNameChange, onColumnChange, onAddColumn, onDeleteColumn, onDeleteTable]);

  const edges = useMemo(() => workspace.relations.map((relation) => {
    const sourceTable = workspace.tables.find((table) => table.id === relation.source);
    const targetTable = workspace.tables.find((table) => table.id === relation.target);
    const sourceField = sourceTable?.columns.find((field) => field.id === relation.sourceColumnId);
    const targetField = targetTable?.columns.find((field) => field.id === relation.targetColumnId);
    return {
      id: relation.id,
      source: relation.source,
      sourceHandle: `source-${relation.sourceColumnId}`,
      target: relation.target,
      targetHandle: `target-${relation.targetColumnId}`,
      type: "smoothstep",
      label: sourceField && targetField ? `${sourceField.name} → ${targetTable?.name}.${targetField.name}` : "Foreign key",
      labelBgPadding: [7, 4] as [number, number],
      labelBgBorderRadius: 6,
      style: { stroke: "#a78bfa", strokeWidth: 2.1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#a78bfa", width: 17, height: 17 },
    };
  }), [workspace.relations, workspace.tables]);

  const sql = useMemo(() => postgresSql(workspace), [workspace]);
  const issues = useMemo(() => validateWorkspace(workspace), [workspace]);

  const copySql = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy SQL"), 1600);
    } catch {
      setCopyLabel("Select to copy");
    }
  }, [sql]);

  const downloadSql = useCallback(() => {
    const blob = new Blob([sql], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "schema"}.sql`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [sql, workspace.name]);

  const loadSample = useCallback(() => {
    setWorkspace(ecommerceSample());
    setNotice("E-commerce Database loaded — a complete example with three foreign keys.");
  }, []);

  const resetWorkspace = useCallback(() => {
    if (window.confirm("Start a new schema? Your current local workspace will be replaced.")) {
      setWorkspace(freshWorkspace());
      setNotice("Fresh schema created. Add tables and connect their fields.");
    }
  }, []);

  return (
    <main className="flex h-screen min-h-[700px] flex-col overflow-hidden bg-[#070b16]">
      <header className="z-20 flex min-h-[72px] shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0a1020]/95 px-4 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <Database size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-extrabold tracking-tight text-white">SchemaForge</h1>
              <span className="hidden rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-300 sm:block">POSTGRESQL</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{saveState}</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-slate-500 lg:flex"><Sparkles size={14} className="text-violet-300" />Visual schema designer <ChevronRight size={14} /> SQL export</div>
        <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-800/70 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-indigo-400/50 hover:bg-indigo-400/10 hover:text-indigo-200">
          <Sparkles size={14} className="text-amber-300" /> <span className="hidden sm:inline">Load example</span>
        </button>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_385px]">
        <div className="relative min-h-[480px] overflow-hidden border-b border-slate-800/80 xl:border-b-0 xl:border-r">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            fitView
            fitViewOptions={{ padding: 0.22, maxZoom: 0.95 }}
            minZoom={0.25}
            maxZoom={1.55}
            deleteKeyCode={["Backspace", "Delete"]}
            defaultEdgeOptions={{ animated: false }}
            connectionLineStyle={{ stroke: "#a78bfa", strokeWidth: 2.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color="#25324a" />
            <Controls showInteractive={false} position="bottom-left" />
            <MiniMap
              position="bottom-right"
              nodeColor="#5967ee"
              maskColor="rgba(7, 11, 22, 0.73)"
              className="!border !border-slate-700/70 !bg-[#0e1626]"
              pannable
              zoomable
            />
            <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[420px] rounded-xl border border-slate-700/60 bg-[#101827]/90 px-3 py-2 text-xs text-slate-300 shadow-xl shadow-black/10 backdrop-blur">
              <span className="mr-2 inline-flex align-middle text-indigo-300"><CircleHelp size={15} /></span>{notice}
            </div>
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
              <button onClick={addTable} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]">
                <Plus size={15} /> Add table
              </button>
              <button title="Start a new schema" onClick={resetWorkspace} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-700/70 bg-[#101827]/90 text-slate-400 shadow-lg transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200">
                <RotateCcw size={15} />
              </button>
            </div>
          </ReactFlow>
          <div className="pointer-events-none absolute bottom-4 left-[74px] hidden rounded-lg border border-slate-700/60 bg-[#101827]/85 px-3 py-1.5 text-[10px] font-semibold text-slate-400 backdrop-blur sm:block">Tip: drag nodes to arrange · drag a field&apos;s right handle to a primary-key handle</div>
        </div>

        <aside className="schema-scroll min-h-0 overflow-y-auto bg-[#0b1120] xl:h-[calc(100vh-72px)]">
          <div className="border-b border-slate-800/80 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-extrabold text-white"><Code2 size={17} className="text-indigo-300" /> PostgreSQL DDL</div>
              <div className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">{workspace.tables.length} TABLE{workspace.tables.length === 1 ? "" : "S"}</div>
            </div>
            <input
              value={workspace.name}
              onChange={(event) => setWorkspace((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-700/70 bg-[#111a2b] px-3 py-2 text-sm font-semibold text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
              aria-label="Schema name"
              placeholder="Schema name"
            />
          </div>

          <div className="px-5 py-4">
            <div className="mb-3 flex gap-2">
              <button onClick={copySql} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-extrabold text-slate-900 transition hover:bg-white"><Copy size={14} /> {copyLabel}</button>
              <button onClick={downloadSql} title="Download .sql" className="grid w-10 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition hover:border-indigo-400/60 hover:text-indigo-200"><Download size={16} /></button>
            </div>
            <pre className="schema-scroll max-h-[380px] overflow-auto rounded-xl border border-slate-800 bg-[#070c17] p-3 text-[11px] leading-5 text-slate-300 shadow-inner"><code>{sql}</code></pre>
          </div>

          <div className="border-t border-slate-800/80 px-5 py-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-extrabold text-white"><Link2 size={16} className="text-violet-300" /> Create relationship</div>
            <p className="mb-3 text-xs leading-5 text-slate-500">Select the foreign-key field first, then choose the primary key it should reference.</p>
            <div className="space-y-2.5">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">From table</span>
                <select
                  aria-label="Foreign key source table"
                  value={relationDraft.sourceTableId}
                  onChange={(event) => setRelationDraft((current) => ({
                    ...current,
                    sourceTableId: event.target.value,
                    sourceColumnId: "",
                    targetTableId: current.targetTableId === event.target.value ? "" : current.targetTableId,
                    targetColumnId: "",
                  }))}
                  className="w-full cursor-pointer rounded-lg border border-slate-700/70 bg-[#111a2b] px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-indigo-400"
                >
                  <option value="">Choose a table</option>
                  {workspace.tables.map((table) => <option key={table.id} value={table.id}>{table.name || "Unnamed table"}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Foreign-key field</span>
                <select
                  aria-label="Foreign key source field"
                  disabled={!draftSourceTable}
                  value={relationDraft.sourceColumnId}
                  onChange={(event) => setRelationDraft((current) => ({ ...current, sourceColumnId: event.target.value }))}
                  className="w-full cursor-pointer rounded-lg border border-slate-700/70 bg-[#111a2b] px-3 py-2 text-xs font-semibold text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:border-indigo-400"
                >
                  <option value="">Choose a field</option>
                  {availableSourceColumns.map((field) => <option key={field.id} value={field.id}>{field.name || "Unnamed field"} · {field.type}</option>)}
                </select>
              </label>

              <div className="my-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300/80"><span className="h-px flex-1 bg-violet-400/20" /> references <span className="h-px flex-1 bg-violet-400/20" /></div>

              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Target table</span>
                <select
                  aria-label="Referenced table"
                  disabled={!relationDraft.sourceTableId}
                  value={relationDraft.targetTableId}
                  onChange={(event) => setRelationDraft((current) => ({ ...current, targetTableId: event.target.value, targetColumnId: "" }))}
                  className="w-full cursor-pointer rounded-lg border border-slate-700/70 bg-[#111a2b] px-3 py-2 text-xs font-semibold text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:border-indigo-400"
                >
                  <option value="">Choose a table</option>
                  {workspace.tables.filter((table) => table.id !== relationDraft.sourceTableId).map((table) => <option key={table.id} value={table.id}>{table.name || "Unnamed table"}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Primary-key field</span>
                <select
                  aria-label="Referenced primary key"
                  disabled={!draftTargetTable}
                  value={relationDraft.targetColumnId}
                  onChange={(event) => setRelationDraft((current) => ({ ...current, targetColumnId: event.target.value }))}
                  className="w-full cursor-pointer rounded-lg border border-slate-700/70 bg-[#111a2b] px-3 py-2 text-xs font-semibold text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:border-indigo-400"
                >
                  <option value="">Choose a primary key</option>
                  {availableTargetColumns.map((field) => <option key={field.id} value={field.id}>{field.name || "Unnamed field"} · {field.type}</option>)}
                </select>
              </label>
              <button
                disabled={!canCreateRelationship}
                onClick={() => createRelationship(relationDraft.sourceTableId, relationDraft.sourceColumnId, relationDraft.targetTableId, relationDraft.targetColumnId)}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Link2 size={14} /> Connect tables
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80 px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400"><Check size={14} className={issues.length ? "text-amber-300" : "text-emerald-300"} /> Schema check</div>
              <span className={`text-[10px] font-bold ${issues.length ? "text-amber-300" : "text-emerald-300"}`}>{issues.length ? `${issues.length} issue${issues.length > 1 ? "s" : ""}` : "Ready to export"}</span>
            </div>
            {issues.length ? (
              <ul className="space-y-2">
                {issues.map((issue) => <li key={issue} className="flex gap-2 text-xs leading-5 text-amber-100/80"><TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-300" />{issue}</li>)}
              </ul>
            ) : (
              <p className="text-xs leading-5 text-slate-500">All foreign keys point to primary keys. The generated SQL is ready for PostgreSQL.</p>
            )}
          </div>

          <div className="border-t border-slate-800/80 px-5 py-4">
            <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Canvas guide</div>
            <div className="space-y-2.5 text-xs leading-5 text-slate-500">
              <p><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400" />Right handle: start a foreign-key connection.</p>
              <p><span className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-400" />Left handle: drop onto the referenced primary key.</p>
              <p><KeyRound size={12} className="mr-1 inline text-amber-300" />Click the key icon to mark a primary key. Delete a selected relationship with Backspace.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
