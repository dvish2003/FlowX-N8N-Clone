import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function outputNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const outputNode: NodeObjType = {
    id: id,
    type: 'outputNode',
    position,
    data: {
      label: label || 'Output',
      icon: icon || '/icons/output.png',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'left',
          type: 'target',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'right' },
            { nodeName: 'gmailNode', handlePosition: 'right' },
            { nodeName: 'driveNode', handlePosition: 'right' },
            { nodeName: 'calendarNode', handlePosition: 'right' },
            { nodeName: 'slackNode', handlePosition: 'right' },
            { nodeName: 'discordNode', handlePosition: 'right' },
            { nodeName: 'modelNode', handlePosition: 'right' },
            { nodeName: 'embeddingModelNode', handlePosition: 'right' },
            { nodeName: 'vectordbNode', handlePosition: 'right' },
          ],
        },
      ],
    },
  } as NodeObjType

  return outputNode
}