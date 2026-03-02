import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function chatTriggerNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const chatTriggerNode: NodeObjType = {
    id: id,
    type: 'chatTriggerNode',
    position,
    data: {
      label: label || 'Chat Trigger',
      icon: icon || '/icons/chat-incoming.png', // Assuming icon exists or fallback
      triggerType: 'chat',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'left' },
          ]
        }
      ]
    }
  } as NodeObjType

  return chatTriggerNode
}
