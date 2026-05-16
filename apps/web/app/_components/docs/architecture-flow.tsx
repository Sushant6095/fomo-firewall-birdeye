"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Cloud,
  Server,
  Database,
  Gauge,
  FileSearch,
  Megaphone,
  Monitor,
  Send,
  Puzzle,
  Cpu
} from "lucide-react";

type NodeKind = "data" | "compute" | "store" | "output" | "agent";

const KIND_STYLE: Record<NodeKind, { border: string; bg: string; text: string }> = {
  data:    { border: "border-tertiary/60",      bg: "bg-tertiary/10",   text: "text-tertiary" },
  compute: { border: "border-warning/60",       bg: "bg-warning/10",    text: "text-warning" },
  store:   { border: "border-on-surface-variant/40", bg: "bg-surface-container-high", text: "text-on-surface" },
  output:  { border: "border-success/60",       bg: "bg-success/10",    text: "text-success" },
  agent:   { border: "border-primary/60",       bg: "bg-primary/10",    text: "text-primary" }
};

function FlowNode({ data }: NodeProps) {
  const d = data as {
    label: string;
    sub?: string;
    kind: NodeKind;
    iconKey?: keyof typeof ICONS;
  };
  const s = KIND_STYLE[d.kind];
  const Icon = d.iconKey ? ICONS[d.iconKey] : null;
  return (
    <div
      className={`group relative flex min-w-[170px] flex-col gap-1 rounded-xl border ${s.border} ${s.bg} px-4 py-3 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4)]`}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-on-surface-variant/60" />
      <div className="flex items-center gap-2">
        {Icon ? <Icon className={`h-3.5 w-3.5 ${s.text}`} /> : null}
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${s.text}`}>
          {d.label}
        </span>
      </div>
      {d.sub ? (
        <span className="font-mono text-[10px] text-on-surface-variant">{d.sub}</span>
      ) : null}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-on-surface-variant/60" />
    </div>
  );
}

const ICONS = {
  Cloud,
  Server,
  Database,
  Gauge,
  FileSearch,
  Megaphone,
  Monitor,
  Send,
  Puzzle,
  Cpu
} as const;

const nodeTypes = { card: FlowNode };

const nodes: Node[] = [
  { id: "birdeye",  type: "card", position: { x:   0, y: 160 }, data: { label: "Birdeye Data API",   sub: "8 endpoints", iconKey: "Cloud", kind: "data" } },
  { id: "worker",   type: "card", position: { x: 240, y:  80 }, data: { label: "Worker / Cron",      sub: "Ingestion",   iconKey: "Server", kind: "compute" } },
  { id: "supabase", type: "card", position: { x: 460, y:   0 }, data: { label: "Supabase Snapshots", sub: "FomoDb",      iconKey: "Database", kind: "store" } },
  { id: "trapscore",type: "card", position: { x: 460, y: 160 }, data: { label: "TrapScore Engine",   sub: "7 signals",   iconKey: "Gauge", kind: "compute" } },
  { id: "evidence", type: "card", position: { x: 700, y: 160 }, data: { label: "Evidence Engine",    sub: "Reasons",     iconKey: "FileSearch", kind: "compute" } },
  { id: "alerts",   type: "card", position: { x: 920, y: 160 }, data: { label: "Alert Router",       sub: "Dedup-aware", iconKey: "Megaphone", kind: "compute" } },
  { id: "web",      type: "card", position: { x:1160, y:  60 }, data: { label: "Web Dashboard",      sub: "/, /board",   iconKey: "Monitor", kind: "output" } },
  { id: "bot",      type: "card", position: { x:1160, y: 160 }, data: { label: "Telegram Bot",       sub: "@fomo_…_bot", iconKey: "Send", kind: "output" } },
  { id: "ext",      type: "card", position: { x:1160, y: 260 }, data: { label: "Browser Extension",  sub: "MV3 popup",   iconKey: "Puzzle", kind: "output" } },
  { id: "mcp",      type: "card", position: { x: 240, y: 320 }, data: { label: "Claude Skills / MCP",sub: "Local dev",   iconKey: "Cpu", kind: "agent" } }
];

const e = (id: string, source: string, target: string, dashed = false) => ({
  id,
  source,
  target,
  type: "smoothstep" as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#94A3B8" },
  style: {
    stroke: dashed ? "#94A3B8" : "#10B981",
    strokeWidth: 1.5,
    strokeDasharray: dashed ? "4 4" : undefined
  }
});

const edges: Edge[] = [
  e("e1", "birdeye", "worker"),
  e("e2", "worker", "supabase"),
  e("e3", "worker", "trapscore"),
  e("e4", "supabase", "trapscore"),
  e("e5", "trapscore", "evidence"),
  e("e6", "evidence", "alerts"),
  e("e7", "alerts", "web"),
  e("e8", "alerts", "bot"),
  e("e9", "alerts", "ext"),
  e("e10", "mcp", "birdeye", true),
  e("e11", "mcp", "trapscore", true)
];

export function ArchitectureFlow() {
  return (
    <div className="my-6 h-[480px] overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll={false}
        zoomOnPinch
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(167,195,176,0.12)" />
        <Controls
          showInteractive={false}
          className="!rounded-lg !border !border-outline-variant !bg-surface-container [&_button]:!bg-transparent [&_button]:!border-0 [&_button:hover]:!bg-surface-container-high [&_svg]:!fill-on-surface-variant"
        />
      </ReactFlow>
    </div>
  );
}
