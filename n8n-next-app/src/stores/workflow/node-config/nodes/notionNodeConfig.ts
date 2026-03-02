import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function notionNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const notionNode: NodeObjType = {
    id: id,
    type: 'notionNode',
    position,
    data: {
      label: label || 'Notion',
      icon: icon || '/icons/notion.png',
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
      ],
    },
  } as NodeObjType

  return notionNode
}