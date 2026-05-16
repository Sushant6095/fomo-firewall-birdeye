"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type SignalNodeData = { label: string; weight: number };
type SumNodeData = { label: string };
type LeafNodeData = { label: string; tone: "score" | "verdict" | "evidence" };

function SignalNode({ data }: NodeProps) {
  const d = data as SignalNodeData;
  return (
    <div className="group relative flex min-w-[200px] items-center justify-between gap-3 rounded-lg border border-outline-variant/50 bg-surface-container px-3 py-2 shadow-[0_4px_18px_rgba(0,0,0,0.4)]">
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-tertiary/70" />
      <span className="text-[12px] text-on-surface">{d.label}</span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-tertiary">
        ×{d.weight}
      </span>
    </div>
  );
}

function SumNode({ data }: NodeProps) {
  const d = data as SumNodeData;
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/70 bg-primary/15 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-primary/70" />
      <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-primary">
        {d.label}
      </span>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-primary/70" />
    </div>
  );
}

function LeafNode({ data }: NodeProps) {
  const d = data as LeafNodeData;
  const tone =
    d.tone === "score"
      ? "border-primary/60 bg-primary/10 text-primary"
      : d.tone === "verdict"
        ? "border-error/60 bg-error/10 text-error"
        : "border-tertiary/60 bg-tertiary/10 text-tertiary";
  return (
    <div className={`flex min-w-[150px] items-center justify-center gap-2 rounded-lg border px-4 py-2 ${tone} shadow-[0_4px_18px_rgba(0,0,0,0.4)]`}>
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-current opacity-50" />
      <span className="text-[12px] font-semibold uppercase tracking-wider">{d.label}</span>
    </div>
  );
}

const nodeTypes = { signal: SignalNode, sum: SumNode, leaf: LeafNode };

const SIGNALS = [
  { id: "s1", label: "Smart Money Divergence",  weight: 25 },
  { id: "s2", label: "Insider Exit Pressure",   weight: 20 },
  { id: "s3", label: "Liquidity Fragility",     weight: 15 },
  { id: "s4", label: "Sell Pressure While Up",  weight: 15 },
  { id: "s5", label: "Holder Concentration",    weight: 10 },
  { id: "s6", label: "Token Security Risk",     weight: 10 },
  { id: "s7", label: "Abnormal Vol / Liq",      weight:  5 }
];

const nodes: Node[] = [
  ...SIGNALS.map((sig, i): Node => ({
    id: sig.id,
    type: "signal",
    position: { x: 0, y: i * 56 },
    data: { label: sig.label, weight: sig.weight }
  })),
  {
    id: "sum",
    type: "sum",
    position: { x: 340, y: SIGNALS.length * 56 / 2 - 36 },
    data: { label: "TrapScore" }
  },
  {
    id: "verdict",
    type: "leaf",
    position: { x: 560, y: SIGNALS.length * 56 / 2 - 60 },
    data: { label: "Verdict", tone: "verdict" }
  },
  {
    id: "evidence",
    type: "leaf",
    position: { x: 560, y: SIGNALS.length * 56 / 2 - 12 },
    data: { label: "Evidence Reasons", tone: "evidence" }
  }
];

const edges: Edge[] = [
  ...SIGNALS.map((sig): Edge => ({
    id: `e-${sig.id}-sum`,
    source: sig.id,
    target: "sum",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#10B981", strokeWidth: 1.2, strokeOpacity: 0.5 }
  })),
  {
    id: "e-sum-verdict",
    source: "sum",
    target: "verdict",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#EF4444" },
    style: { stroke: "#EF4444", strokeWidth: 1.8 }
  },
  {
    id: "e-sum-evidence",
    source: "sum",
    target: "evidence",
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#22D3EE" },
    style: { stroke: "#22D3EE", strokeWidth: 1.8 }
  }
];

export function TrapScoreFlow() {
  return (
    <div className="my-6 h-[440px] overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
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
        zoomOnScroll={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(16,185,129,0.10)" />
      </ReactFlow>
    </div>
  );
}
