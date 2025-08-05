"use client"

import type React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
  ReactFlowProvider,
  type NodeTypes,
  useStore,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { initialNodes, initialEdges, type AppNode } from "@/lib/flow-data"
import {
  applyCompleteHighlighting,
  DEFAULT_HIGHLIGHTING_CONFIG,
  type HighlightingConfig,
} from "@/lib/highlighting-logic"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

const transformNodes = (nodes: AppNode[]): Node[] => {
  return nodes.map((node) => {
    if (node.parentId) {
      const { parentId, ...rest } = node
      return { ...rest, parentNode: parentId }
    }
    return node as Node
  })
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35]
const GAP_WIDTH = 16

// Custom highlighting configuration (optional - uses defaults if not provided)
const CUSTOM_HIGHLIGHTING_CONFIG: HighlightingConfig = {
  ...DEFAULT_HIGHLIGHTING_CONFIG,
  // You can override specific values here if needed
  // highlightedEdgeColor: "#ff6b6b", // Example: red highlighted edges
}

const Flow = () => {
  const reactFlowNodes = useMemo(() => transformNodes(initialNodes), [])
  const [nodes, setNodes] = useState<Node[]>(reactFlowNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  /**
   * Handles node click events
   * Toggles selection state - clicking the same node deselects it
   */
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Don't select background nodes
    if (node.type === "background") {
      setSelectedNodeId(null)
      return
    }

    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedNodeId((currentId) => (currentId === node.id ? null : node.id))
  }, [])

  /**
   * Handles clicks on the diagram background
   * Clears any current selection
   */
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Layout calculation effect (unchanged)
  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((currentNodes) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0

        const newNodes = [...currentNodes]
        const sectionDimensions: Record<string, { x: number; width: number }> = {}

        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
            sectionDimensions[sectionId] = { x: currentX, width: sectionWidth }

            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: { x: currentX, y: 0 },
              style: {
                ...newNodes[nodeIndex].style,
                width: `${sectionWidth}px`,
                height: `${height}px`,
              },
            }
            currentX += sectionWidth + GAP_WIDTH
          }
        }

        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]
          if (node.parentNode && sectionDimensions[node.parentNode]) {
            const parentDimensions = sectionDimensions[node.parentNode]
            const originalNode = reactFlowNodes.find((n) => n.id === node.id)
            const originalParent = reactFlowNodes.find((n) => n.id === node.parentNode)

            if (originalNode && originalParent && originalParent.style?.width) {
              const originalParentWidth = Number.parseFloat(originalParent.style.width as string)
              const originalRelativeXOffset = originalNode.position.x - originalParent.position.x
              const newAbsoluteX =
                parentDimensions.x + (originalRelativeXOffset / originalParentWidth) * parentDimensions.width

              newNodes[i] = {
                ...node,
                position: {gt
                  x: newAbsoluteX,
                  y: node.position.y,
                },
              }
            }
          }
        }
        return newNodes
      })
    }
  }, [width, height, reactFlowNodes])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  )

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerStart: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            style: { strokeWidth: 2, stroke: "#6b7280" },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  /**
   * Apply highlighting logic using the isolated highlighting system
   * This replaces the previous inline highlighting calculations
   */
  const { styledNodes, styledEdges } = useMemo(() => {
    return applyCompleteHighlighting(nodes, edges, selectedNodeId, CUSTOM_HIGHLIGHTING_CONFIG)
  }, [nodes, edges, selectedNodeId])

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      className="bg-white"
      fitView
      fitViewOptions={{ padding: 0.1 }}
    >
      <Controls />
      <Background gap={16} size={1} />
    </ReactFlow>
  )
}

export function FlowDiagram() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
