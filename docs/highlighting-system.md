# Flow Diagram Highlighting System

## Overview

The highlighting system provides visual feedback when users interact with nodes in the flow diagram. When a node is selected, the system highlights the selected node, all connected nodes, and the connecting edges while dimming unrelated elements.

## Architecture

The highlighting logic is isolated in `lib/highlighting-logic.ts` and consists of several modular functions:

### Core Functions

#### `calculateHighlighting(selectedNodeId, edges)`
- **Purpose**: Determines which nodes and edges should be highlighted
- **Input**: Selected node ID and array of edges
- **Output**: Sets of highlighted node and edge IDs
- **Logic**: Traverses edges to find all connections to the selected node

#### `applyNodeHighlighting(nodes, highlightingResult, selectedNodeId, config)`
- **Purpose**: Applies visual styling to nodes based on highlighting state
- **Behavior**: 
  - Highlighted nodes: Full opacity
  - Background nodes: Always full opacity
  - Other nodes: Dimmed opacity when selection exists

#### `applyEdgeHighlighting(edges, highlightingResult, selectedNodeId, config)`
- **Purpose**: Applies visual styling to edges based on highlighting state
- **Behavior**:
  - Highlighted edges: Thicker stroke, different color, animated
  - Other edges: Normal styling, dimmed when selection exists

#### `applyCompleteHighlighting(nodes, edges, selectedNodeId, config)`
- **Purpose**: Convenience function that combines all highlighting operations
- **Returns**: Styled nodes, styled edges, and highlighting calculation result

## Configuration

The system uses a configuration object to control visual appearance:

\`\`\`typescript
interface HighlightingConfig {
  dimmedOpacity: number           // 0.3 - Opacity for non-highlighted elements
  highlightedOpacity: number      // 1.0 - Opacity for highlighted elements
  highlightedStrokeWidth: number  // 3 - Stroke width for highlighted edges
  normalStrokeWidth: number       // 2 - Stroke width for normal edges
  highlightedEdgeColor: string    // "#3b82f6" - Color for highlighted edges
  normalEdgeColor: string         // "#6b7280" - Color for normal edges
}
\`\`\`

## Usage in Components

### FlowDiagram Component Integration

\`\`\`typescript
// In components/flow-diagram.tsx
const { styledNodes, styledEdges } = useMemo(() => {
  return applyCompleteHighlighting(
    nodes,
    edges,
    selectedNodeId,
    CUSTOM_HIGHLIGHTING_CONFIG
  )
}, [nodes, edges, selectedNodeId])
\`\`\`

### Event Handling

The system responds to these user interactions:

1. **Node Click**: Toggles selection (same node deselects, different node selects)
2. **Background Click**: Clears selection
3. **Background Nodes**: Cannot be selected (always pass-through)

## Visual Behavior

### Selection States

1. **No Selection**: All elements at full opacity
2. **Node Selected**: 
   - Selected node + connected nodes: Full opacity
   - Connected edges: Highlighted style + animation
   - Background sections: Full opacity (always visible)
   - Other elements: Dimmed opacity

### Edge Animation

Highlighted edges receive a flowing animation to draw attention to the connection paths.

## Testing

The highlighting logic includes comprehensive tests covering:

- Empty selection scenarios
- Single node selection with connections
- Isolated nodes (no connections)
- Background node behavior
- Configuration application
- Complete workflow integration

## Customization

To modify highlighting behavior:

1. **Visual Styling**: Update `HighlightingConfig` values
2. **Selection Logic**: Modify `calculateHighlighting` function
3. **Animation**: Adjust edge `animated` property in `applyEdgeHighlighting`
4. **Opacity Rules**: Update opacity calculations in styling functions

## Performance Considerations

- Highlighting calculations use `useMemo` to prevent unnecessary recalculations
- Set-based lookups provide O(1) performance for highlight checks
- Styling is applied only when selection state changes

## Future Enhancements

Potential improvements to consider:

1. **Multi-selection**: Support selecting multiple nodes
2. **Path Highlighting**: Highlight entire paths between nodes
3. **Filtering**: Hide non-highlighted elements completely
4. **Custom Animations**: Different animation types for different edge types
5. **Keyboard Navigation**: Arrow key navigation with highlighting
