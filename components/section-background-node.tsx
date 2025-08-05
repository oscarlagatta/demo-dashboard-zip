import type { NodeProps, Node } from "@xyflow/react"

type SectionBackgroundNodeData = {
  title: string
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

const SectionBackgroundNode = ({ data, style }: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div
      style={style}
      className="h-full w-full rounded-lg border-2 border-gray-300 [border-style:inset] transition-opacity duration-300"
    >
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-700">{data.title}</h2>
      </div>
    </div>
  )
}

export default SectionBackgroundNode
