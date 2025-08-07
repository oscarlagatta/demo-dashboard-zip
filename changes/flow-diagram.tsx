"use client"

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
  useViewport,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { initialNodes, initialEdges, type AppNode } from "@/lib/flow-data"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import ParallelEdge from "./parallel-edge"
import GroupNode from "./group-node"

// Explicitly type the nodeTypes object.
// This ensures all components passed in are compatible with React Flow.
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
  group: GroupNode,
}

const edgeTypes: EdgeTypes = {
  parallel: ParallelEdge,
}

// This function transforms our app's node data (with `parentId`)
// into the format React Flow expects (with `parentNode`).
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
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35] // Proportions must sum to 1
const GAP_WIDTH = 16 // The gap between sections in pixels

// Helper function to get directly connected nodes only (1-hop neighbors)
const getCluster = (rootId: string, edges: Edge[]): Set<string> => {
  const cluster = new Set<string>()
  cluster.add(rootId) // Include the clicked node itself
  
  // Find all directly connected nodes in O(E) time
  for (const edge of edges) {
    if (edge.source === rootId) {
      cluster.add(edge.target)
    } else if (edge.target === rootId) {
      cluster.add(edge.source)
    }
  }
  
  return cluster
}

const Flow = () => {
  // Transform nodes once before setting state
  const reactFlowNodes = useMemo(() => transformNodes(initialNodes), [])
  const [nodes, setNodes] = useState<Node[]>(reactFlowNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set())
  const { width, height } = useViewport()

  // Handle node click to highlight directly connected nodes
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    
    // Only process clicks on AIT nodes (custom type)
    if (node.type === 'custom') {
      const cluster = getCluster(node.id, edges)
      setActiveIds(cluster)
    }
  }, [edges])

  // Handle pane click to clear highlights
  const onPaneClick = useCallback(() => {
    setActiveIds(new Set())
  }, [])

  // Update nodes with active class
  const nodesWithActiveClass = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      className: activeIds.has(node.id) ? 'node--active' : undefined
    }))
  }, [nodes, activeIds])

  // Update edges with animation and styling
  const edgesWithAnimation = useMemo(() => {
    return edges.map(edge => {
      const isActive = activeIds.has(edge.source) && activeIds.has(edge.target)
      return {
        ...edge,
        animated: isActive,
        style: isActive 
          ? { ...edge.style, strokeWidth: 3 }
          : edge.style
      }
    })
  }, [edges, activeIds])

  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((nds) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0
        const newNodes = [...nds]

        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
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
        return newNodes
      })
    }
  }, [width, height])

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
            type: "parallel",
            markerStart: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            style: { strokeWidth: 2, stroke: "#6b7280" },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  return (
    <ReactFlow
      nodes={nodesWithActiveClass}
      edges={edgesWithAnimation}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      proOptions={{ hideAttribution: true }}
      className="bg-white"
    >
      <Controls />
      <Background gap={16} size={1} />
    </ReactFlow>
  )
}

export default function FlowDiagram() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
