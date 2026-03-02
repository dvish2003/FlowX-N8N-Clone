import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function discordNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const discordNode: NodeObjType = {
    id: id,
    type: 'discordNode',
    position,
    data: {
      label: label || 'Discord',
      icon: icon || '/icons/discord.png',
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

  return discordNode
}