/**
 * Test suite for highlighting logic
 * This file demonstrates how to test the isolated highlighting functionality
 */

import { describe, it, expect } from "@jest/globals"
import type { Edge } from "@xyflow/react"
import {
  calculateHighlighting,
  applyNodeHighlighting,
  applyEdgeHighlighting,
  applyCompleteHighlighting,
  DEFAULT_HIGHLIGHTING_CONFIG,
} from "../highlighting-logic"

// Mock data for testing
const mockEdges: Edge[] = [
  { id: "e1", source: "node1", target: "node2", type: "default" },
  { id: "e2", source: "node2", target: "node3", type: "default" },
  { id: "e3", source: "node1", target: "node4", type: "default" },
  { id: "e4", source: "node5", target: "node6", type: "default" },
]

const mockNodes = [
  { id: "node1", type: "custom", position: { x: 0, y: 0 }, data: {} },
  { id: "node2", type: "custom", position: { x: 100, y: 0 }, data: {} },
  { id: "node3", type: "custom", position: { x: 200, y: 0 }, data: {} },
  { id: "node4", type: "custom", position: { x: 0, y: 100 }, data: {} },
  { id: "node5", type: "custom", position: { x: 100, y: 100 }, data: {} },
  { id: "node6", type: "custom", position: { x: 200, y: 100 }, data: {} },
  { id: "bg1", type: "background", position: { x: 0, y: 0 }, data: {} },
]

describe("calculateHighlighting", () => {
  it("should return empty sets when no node is selected", () => {
    const result = calculateHighlighting(null, mockEdges)

    expect(result.highlightedNodes.size).toBe(0)
    expect(result.highlightedEdges.size).toBe(0)
  })

  it("should highlight connected nodes and edges for selected node", () => {
    const result = calculateHighlighting("node1", mockEdges)

    // node1 connects to node2 and node4
    expect(result.highlightedNodes).toEqual(new Set(["node1", "node2", "node4"]))
    expect(result.highlightedEdges).toEqual(new Set(["e1", "e3"]))
  })

  it("should handle nodes with no connections", () => {
    const isolatedEdges: Edge[] = [{ id: "e1", source: "node1", target: "node2", type: "default" }]

    const result = calculateHighlighting("node3", isolatedEdges)

    // Only the selected node should be highlighted (no connections)
    expect(result.highlightedNodes).toEqual(new Set(["node3"]))
    expect(result.highlightedEdges.size).toBe(0)
  })
})

describe("applyNodeHighlighting", () => {
  it("should apply full opacity when no selection", () => {
    const highlightingResult = { highlightedNodes: new Set(), highlightedEdges: new Set() }
    const result = applyNodeHighlighting(mockNodes, highlightingResult, null)

    result.forEach((node) => {
      expect(node.style?.opacity).toBe(DEFAULT_HIGHLIGHTING_CONFIG.highlightedOpacity)
    })
  })

  it("should dim non-highlighted nodes when selection exists", () => {
    const highlightingResult = {
      highlightedNodes: new Set(["node1", "node2"]),
      highlightedEdges: new Set(),
    }
    const result = applyNodeHighlighting(mockNodes, highlightingResult, "node1")

    const highlightedNode = result.find((n) => n.id === "node1")
    const dimmedNode = result.find((n) => n.id === "node3")
    const backgroundNode = result.find((n) => n.id === "bg1")

    expect(highlightedNode?.style?.opacity).toBe(DEFAULT_HIGHLIGHTING_CONFIG.highlightedOpacity)
    expect(dimmedNode?.style?.opacity).toBe(DEFAULT_HIGHLIGHTING_CONFIG.dimmedOpacity)
    expect(backgroundNode?.style?.opacity).toBe(DEFAULT_HIGHLIGHTING_CONFIG.highlightedOpacity) // Background stays visible
  })
})

describe("applyEdgeHighlighting", () => {
  it("should style highlighted edges differently", () => {
    const highlightingResult = {
      highlightedNodes: new Set(),
      highlightedEdges: new Set(["e1", "e2"]),
    }
    const result = applyEdgeHighlighting(mockEdges, highlightingResult, "node1")

    const highlightedEdge = result.find((e) => e.id === "e1")
    const normalEdge = result.find((e) => e.id === "e4")

    expect(highlightedEdge?.style?.strokeWidth).toBe(DEFAULT_HIGHLIGHTING_CONFIG.highlightedStrokeWidth)
    expect(highlightedEdge?.style?.stroke).toBe(DEFAULT_HIGHLIGHTING_CONFIG.highlightedEdgeColor)
    expect(highlightedEdge?.animated).toBe(true)

    expect(normalEdge?.style?.strokeWidth).toBe(DEFAULT_HIGHLIGHTING_CONFIG.normalStrokeWidth)
    expect(normalEdge?.style?.stroke).toBe(DEFAULT_HIGHLIGHTING_CONFIG.normalEdgeColor)
    expect(normalEdge?.animated).toBe(false)
  })
})

describe("applyCompleteHighlighting", () => {
  it("should return styled nodes and edges with highlighting result", () => {
    const result = applyCompleteHighlighting(mockNodes, mockEdges, "node1")

    expect(result.styledNodes).toBeDefined()
    expect(result.styledEdges).toBeDefined()
    expect(result.highlightingResult).toBeDefined()

    // Verify the highlighting calculation was applied
    expect(result.highlightingResult.highlightedNodes).toEqual(new Set(["node1", "node2", "node4"]))
    expect(result.highlightingResult.highlightedEdges).toEqual(new Set(["e1", "e3"]))
  })
})
