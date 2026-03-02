import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function embeddingModelNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const embeddingNode: NodeObjType = {
    id: id,
    type: 'embeddingModelNode',
    position,
    data: {
      label: label || 'Embedding Model',
      icon: icon || '/icons/embedding.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'left',
          type: 'target',
          LinkTo: [
            { nodeName: 'inputNode', handlePosition: 'right' },
          ],
        },
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'vectordbNode', handlePosition: 'left' },
            { nodeName: 'outputNode', handlePosition: 'left' },
          ],
        },
      ],
    },
  } as NodeObjType

  return embeddingNode
}