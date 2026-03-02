import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function inputNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const inputNode: NodeObjType = {
    id: id,
    type: 'inputNode',
    position,
    data: {
      label: label || 'Input',
      icon: icon || '/icons/input.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'left' },
            { nodeName: 'tool', handlePosition: 'top' },
            { nodeName: 'modelNode', handlePosition: 'left' },
            { nodeName: 'embeddingModelNode', handlePosition: 'left' },
            { nodeName: 'vectordbNode', handlePosition: 'left' },
          ],
        },
      ],
    },
  } as NodeObjType

  return inputNode
}