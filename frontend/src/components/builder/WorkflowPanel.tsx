"use client";

import "@xyflow/react/dist/style.css";
import {
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  MarkerType,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { QUESTION_TYPE_META } from "./questionTypes";
import { WorkflowNode } from "./workflow/WorkflowNode";
import { ActionsDrawer } from "./workflow/ActionsDrawer";

const nodeTypes = { workflowNode: WorkflowNode };

const SUB_TABS = ["Branching", "Scoring", "Tagging", "Outcome quiz"];

const EDGE_COLOR = "#a8a29e";
const NODE_WIDTH = 176;
const GAP = 64;
const ROW_Y = 80;

function buildGraph(questions: Question[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    { id: "pull-data-in", type: "workflowNode", position: { x: 0, y: ROW_Y }, draggable: false, data: { icon: "↓", label: "Pull data in", variant: "info" } },
  ];
  const edges: Edge[] = [];
  const edgeStyle = { stroke: EDGE_COLOR };
  const markerEnd = { type: MarkerType.ArrowClosed, color: EDGE_COLOR };

  let previousId = "pull-data-in";
  questions.forEach((question, index) => {
    const meta = QUESTION_TYPE_META[question.type];
    nodes.push({
      id: question.id,
      type: "workflowNode",
      position: { x: (index + 1) * (NODE_WIDTH + GAP), y: ROW_Y },
      data: { icon: meta.icon, number: index + 1, label: question.title || meta.defaultTitle, variant: "question" },
    });
    edges.push({ id: `${previousId}->${question.id}`, source: previousId, target: question.id, style: edgeStyle, markerEnd });
    previousId = question.id;
  });

  nodes.push({
    id: "ending",
    type: "workflowNode",
    position: { x: (questions.length + 1) * (NODE_WIDTH + GAP), y: ROW_Y },
    draggable: false,
    data: { icon: "✓", label: "Ending", variant: "ending" },
  });
  edges.push({ id: `${previousId}->ending`, source: previousId, target: "ending", style: edgeStyle, markerEnd });

  return { nodes, edges };
}

export function WorkflowPanel({ questions, onPreviewClick }: { questions: Question[]; onPreviewClick: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [trackpadMode, setTrackpadMode] = useState(false);

  const initialGraph = useMemo(() => buildGraph(questions), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraph.edges);

  // Resync the graph when questions are added/removed/reordered in the Content tab,
  // without discarding manual node drags for questions that still exist.
  useEffect(() => {
    const next = buildGraph(questions);
    setNodes((current) => {
      const positionById = new Map(current.map((n) => [n.id, n.position]));
      return next.nodes.map((n) => ({ ...n, position: positionById.get(n.id) ?? n.position }));
    });
    setEdges(next.edges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, style: { stroke: EDGE_COLOR }, markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR } }, eds)),
    [setEdges]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1">
          {SUB_TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveSubTab(i)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeSubTab === i ? "bg-paper-soft text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onPreviewClick}
            aria-label="Preview"
            title="Preview"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            ▶
          </button>
          <div className="mx-1 h-5 w-px bg-line" />
          <button
            aria-label="Variables"
            title="Variables"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            ⋈
          </button>
          <button
            aria-label="Version History"
            title="Version History"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            ↻
          </button>
          <button
            aria-label="Form settings"
            title="Form settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            ⚙
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            panOnScroll={trackpadMode}
            zoomOnScroll={!trackpadMode}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e5e3" />
            <Controls showInteractive={false} position="bottom-left">
              <ControlButton
                onClick={() => setTrackpadMode((v) => !v)}
                title="Open mouse or trackpad preferences"
                aria-label="Open mouse or trackpad preferences"
              >
                <span style={{ fontSize: 11 }}>{trackpadMode ? "⌨" : "◎"}</span>
              </ControlButton>
            </Controls>
          </ReactFlow>
        </div>

        <ActionsDrawer />
      </div>
    </div>
  );
}
