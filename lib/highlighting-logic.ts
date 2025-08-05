import type { Edge, Node } from "@xyflow/react"

/**
 * Represents the result of highlighting calculations
 */
export interface HighlightingResult {
  /** Set of node IDs that should be highlighted */
  highlightedNodes: Set<string>
  /** Set of edge IDs that should be highlighted */
  highlightedEdges: Set<string>
}

/**
 * Configuration options for highlighting behavior
 */
export interface HighlightingConfig {
  /** Opacity for non-highlighted elements when a selection is active */
  dimmedOpacity: number
  /** Opacity for highlighted elements */
  highlightedOpacity: number
  /** Stroke width for highlighted edges */
  highlightedStrokeWidth: number
  /** Stroke width for normal edges */
  normalStrokeWidth: number
  /** Color for highlighted edges */
  highlightedEdgeColor: string
  /** Color for normal edges */
  normalEdgeColor: string
}

/**
 * Default configuration for highlighting
 */
export const DEFAULT_HIGHLIGHTING_CONFIG: HighlightingConfig = {
  dimmedOpacity: 0.3,
  highlightedOpacity: 1,
  highlightedStrokeWidth: 3,
  normalStrokeWidth: 2,
  highlightedEdgeColor: "#3b82f6",
  normalEdgeColor: "#6b7280",
}

/**
 * Calculates which nodes and edges should be highlighted based on the selected node
 *
 * @param selectedNodeId - The ID of the currently selected node, or null if none selected
 * @param edges - Array of all edges in the flow diagram
 * @returns HighlightingResult containing sets of highlighted node and edge IDs
 *
 * @example
 * ```typescript
 * const result = calculateHighlighting("node-1", edges);
 * console.log(result.highlightedNodes); // Set containing "node-1" and connected nodes
 * console.log(result.highlightedEdges); // Set containing edges connected to "node-1"
 * ```
 */
export function calculateHighlighting(selectedNodeId: string | null, edges: Edge[]): HighlightingResult {
  // If no node is selected, return empty sets (no highlighting)
  if (!selectedNodeId) {
    return {
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    }
  }

  // Initialize sets with the selected node
  const highlightedNodes = new Set<string>([selectedNodeId])
  const highlightedEdges = new Set<string>()

  // Find all edges connected to the selected node
  edges.forEach((edge) => {
    const isConnectedToSelected = edge.source === selectedNodeId || edge.target === selectedNodeId

    if (isConnectedToSelected) {
      // Add the edge to highlighted edges
      highlightedEdges.add(edge.id)

      // Add both source and target nodes to highlighted nodes
      highlightedNodes.add(edge.source)
      highlightedNodes.add(edge.target)
    }
  })

  return {
    highlightedNodes,
    highlightedEdges,
  }
}

/**
 * Applies highlighting styles to nodes based on the highlighting result
 *
 * @param nodes - Array of nodes to style
 * @param highlightingResult - Result from calculateHighlighting
 * @param selectedNodeId - Currently selected node ID
 * @param config - Highlighting configuration options
 * @returns Array of nodes with updated styles
 *
 * @example
 * ```typescript
 * const styledNodes = applyNodeHighlighting(
 *   nodes,
 *   highlightingResult,
 *   "node-1",
 *   DEFAULT_HIGHLIGHTING_CONFIG
 * );
 * ```
 */
export function applyNodeHighlighting(
  nodes: Node[],
  highlightingResult: HighlightingResult,
  selectedNodeId: string | null,
  config: HighlightingConfig = DEFAULT_HIGHLIGHTING_CONFIG,
): Node[] {
  return nodes.map((node) => {
    // Determine opacity based on selection state
    let opacity = config.highlightedOpacity // Default to full opacity

    if (selectedNodeId) {
      // If there's a selection, check if this node should be highlighted
      const isHighlighted = highlightingResult.highlightedNodes.has(node.id)
      const isBackgroundNode = node.type === "background"

      // Background nodes always stay visible, others are dimmed if not highlighted
      opacity = isHighlighted || isBackgroundNode ? config.highlightedOpacity : config.dimmedOpacity
    }

    return {
      ...node,
      style: {
        ...node.style,
        opacity,
      },
    }
  })
}

/**
 * Applies highlighting styles to edges based on the highlighting result
 *
 * @param edges - Array of edges to style
 * @param highlightingResult - Result from calculateHighlighting
 * @param selectedNodeId - Currently selected node ID
 * @param config - Highlighting configuration options
 * @returns Array of edges with updated styles and animation
 *
 * @example
 * ```typescript
 * const styledEdges = applyEdgeHighlighting(
 *   edges,
 *   highlightingResult,
 *   "node-1",
 *   DEFAULT_HIGHLIGHTING_CONFIG
 * );
 * ```
 */
export function applyEdgeHighlighting(
  edges: Edge[],
  highlightingResult: HighlightingResult,
  selectedNodeId: string | null,
  config: HighlightingConfig = DEFAULT_HIGHLIGHTING_CONFIG,
): Edge[] {
  return edges.map((edge) => {
    const isHighlighted = highlightingResult.highlightedEdges.has(edge.id)

    // Determine styling based on highlight state
    const strokeWidth = isHighlighted ? config.highlightedStrokeWidth : config.normalStrokeWidth

    const strokeColor = isHighlighted ? config.highlightedEdgeColor : config.normalEdgeColor

    const opacity = selectedNodeId
      ? isHighlighted
        ? config.highlightedOpacity
        : config.dimmedOpacity
      : config.highlightedOpacity

    return {
      ...edge,
      style: {
        ...edge.style,
        strokeWidth,
        stroke: strokeColor,
        opacity,
      },
      // Animate highlighted edges for better visual feedback
      animated: isHighlighted,
    }
  })
}

/**
 * Complete highlighting system that combines calculation and styling
 * This is a convenience function that handles the entire highlighting workflow
 *
 * @param nodes - Array of nodes to process
 * @param edges - Array of edges to process
 * @param selectedNodeId - Currently selected node ID
 * @param config - Highlighting configuration options
 * @returns Object containing styled nodes and edges
 *
 * @example
 * ```typescript
 * const { styledNodes, styledEdges } = applyCompleteHighlighting(
 *   nodes,
 *   edges,
 *   selectedNodeId,
 *   customConfig
 * );
 * ```
 */
export function applyCompleteHighlighting(
  nodes: Node[],
  edges: Edge[],
  selectedNodeId: string | null,
  config: HighlightingConfig = DEFAULT_HIGHLIGHTING_CONFIG,
) {
  // Calculate which elements should be highlighted
  const highlightingResult = calculateHighlighting(selectedNodeId, edges)

  // Apply styles to nodes and edges
  const styledNodes = applyNodeHighlighting(nodes, highlightingResult, selectedNodeId, config)
  const styledEdges = applyEdgeHighlighting(edges, highlightingResult, selectedNodeId, config)

  return {
    styledNodes,
    styledEdges,
    highlightingResult, // Also return the calculation result for debugging/inspection
  }
}
