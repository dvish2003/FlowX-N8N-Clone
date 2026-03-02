import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function toolNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const toolNode: NodeObjType = {
    id: id,
    type: 'tool',
    position,
    data: {
      label: label || 'Tool',
      icon: icon || '/icons/tool.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'top',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'right' },
            { nodeName: 'inputNode', handlePosition: 'right' },
          ],
        },
      ],
    },
  } as NodeObjType

  return toolNode
}