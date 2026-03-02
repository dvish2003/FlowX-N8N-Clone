import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function vectordbNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const vectordbNode: NodeObjType = {
    id: id,
    type: 'vectordbNode',
    position,
    data: {
      label: label || 'Vector DB',
      icon: icon || '/icons/db.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'left',
          type: 'target',
          LinkTo: [
            { nodeName: 'modelNode', handlePosition: 'right' },
            { nodeName: 'embeddingModelNode', handlePosition: 'right' },
          ],
        },
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'left' },
            { nodeName: 'outputNode', handlePosition: 'left' },
          ],
        },
      ],
    },
  } as NodeObjType

  return vectordbNode
}