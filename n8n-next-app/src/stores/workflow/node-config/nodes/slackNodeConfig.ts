import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function slackNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const slackNode: NodeObjType = {
    id: id,
    type: 'slackNode',
    position,
    data: {
      label: label || 'Slack',
      icon: icon || '/icons/slack.png',
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

  return slackNode
}