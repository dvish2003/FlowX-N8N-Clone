import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function gmailNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const gmailNode: NodeObjType = {
    id: id,
    type: 'gmailNode',
    position,
    data: {
      label: label || 'Gmail',
      icon: icon || '/icons/gmail.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'left',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'right' },
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

  return gmailNode
}