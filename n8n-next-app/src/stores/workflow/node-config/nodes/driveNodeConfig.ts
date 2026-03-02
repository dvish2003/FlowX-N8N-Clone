import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function driveNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const driveNode: NodeObjType = {
    id: id,
    type: 'driveNode',
    position,
    data: {
      label: label || 'Google Drive',
      icon: icon || '/icons/drive.png',
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

  return driveNode
}