import { memo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type CustomNodeData = {
  title: string
  subtext: string
}

type CustomNodeType = Node<CustomNodeData>

const CustomNode = ({ data, style }: NodeProps<CustomNodeType>) => {
  return (
    <Card
      style={style}
      className="shadow-md bg-gray-100 border-2 border-[rgb(10,49,97)] transition-opacity duration-300"
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Top} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 w-2 h-2" />
      <CardHeader className="p-2">
        <CardTitle className="text-xs font-bold whitespace-nowrap">{data.title}</CardTitle>
        <p className="text-[10px] text-muted-foreground">{data.subtext}</p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex space-x-1">
          <Button variant="outline" className="h-6 px-2 text-[10px] shadow-sm bg-transparent">
            Flow
          </Button>
          <Button variant="outline" className="h-6 px-2 text-[10px] shadow-sm bg-transparent">
            Trend
          </Button>
          <Button variant="outline" className="h-6 px-2 text-[10px] shadow-sm bg-transparent">
            Balanced
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
