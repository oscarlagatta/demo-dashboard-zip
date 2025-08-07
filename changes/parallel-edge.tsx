"use client"

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react"
import { useMemo } from "react"

// This function calculates the perpendicular offset for a given edge.
function getEdgeOffset(sourceX: number, sourceY: number, targetX: number, targetY: number, index: number) {
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const length = Math.sqrt(dx * dx + dy * dy)

  // If the nodes are at the same position, no offset is needed.
  if (length === 0) {
    return { offsetX: 0, offsetY: 0 }
  }

  // Calculate the perpendicular vector.
  const offsetX = (dy / length) * 6 * index
  const offsetY = -(dx / length) * 6 * index

  return { offsetX, offsetY }
}

export default function ParallelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  markerStart,
}: EdgeProps) {
  // If no parallelIndex is provided, default to 0 (no offset).
  const { parallelIndex = 0 } = data || {}

  // Calculate the offset based on the edge's position.
  const { offsetX, offsetY } = useMemo(
    () => getEdgeOffset(sourceX, sourceY, targetX, targetY, parallelIndex),
    [sourceX, sourceY, targetX, targetY, parallelIndex],
  )

  // Get the path for a smooth step edge, applying the calculated offsets to the source and target points.
  const [path] = getSmoothStepPath({
    sourceX: sourceX + offsetX,
    sourceY: sourceY + offsetY,
    targetX: targetX + offsetX,
    targetY: targetY + offsetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={{ stroke: "#6b7280", strokeWidth: 2 }}
      className="react-flow__edge-parallel"
    />
  )
}
