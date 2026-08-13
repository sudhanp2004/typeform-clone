"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface WorkflowNodeData extends Record<string, unknown> {
  icon: string;
  label: string;
  number?: number;
  variant: "question" | "info" | "ending";
}

export function WorkflowNode({ data }: NodeProps) {
  const { icon, label, number, variant } = data as WorkflowNodeData;

  return (
    <div
      className={`flex w-44 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center ${
        variant === "info"
          ? "border-dashed border-line bg-white"
          : variant === "ending"
            ? "border-line/60 bg-white/60"
            : "border-line bg-white shadow-sm"
      }`}
    >
      {variant !== "info" && <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-white !bg-ink-soft/50" />}
      <span className="flex h-6 w-6 items-center justify-center rounded bg-paper-soft text-xs font-bold text-ink-soft">
        {icon}
      </span>
      {number !== undefined && <span className="text-[10px] font-semibold text-ink-soft">{number}</span>}
      <span className="line-clamp-2 text-xs font-medium text-ink">{label}</span>
      {variant !== "ending" && <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-white !bg-ink-soft/50" />}
    </div>
  );
}
