import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function agentNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const agentConfigNode: NodeObjType = {
    id: id,
    type: 'agent',
    position,
    data: {
      label: label || "AI Agent",
      icon: icon || "/icons/bot.png",
      sub: 'Tool Agent',
      name: 'My Agent',
      task: 'Help the user',
      instruction: 'You are a helpful assistant.'
    },
    constraints: {
      nodeHandles: [
        {
          name: 'left',
          type: 'target',
          LinkTo: [
             { nodeName: 'chatTriggerNode', handlePosition: 'right' }
          ]
        },
        {
          name: 'right',
          type: 'source',
          LinkTo: [
             { nodeName: 'outputNode', handlePosition: 'left' }
          ]
        },
        {
          name: 'chat-model',
          type: 'source',
          LinkTo: [
            { nodeName: 'modelNode', handlePosition: 'top' },
            { nodeName: 'groqNode', handlePosition: 'top' },
          ]
        },
        {
          name: 'memory',
          type: 'source',
          LinkTo: [
            { nodeName: 'mongoDBNode', handlePosition: 'top' },
          ]
        },
        {
          name: 'tool',
          type: 'source',
          LinkTo: [
            { nodeName: 'retrieverNode', handlePosition: 'top' },
            { nodeName: 'tool', handlePosition: 'top' },
            { nodeName: 'gmailNode', handlePosition: 'top' },
            { nodeName: 'driveNode', handlePosition: 'top' },
            { nodeName: 'calendarNode', handlePosition: 'top' },
            { nodeName: 'slackNode', handlePosition: 'top' },
            { nodeName: 'discordNode', handlePosition: 'top' },
            { nodeName: 'vectordbNode', handlePosition: 'top' },
          ]
        }
      ]
    },
  } as NodeObjType

  return agentConfigNode
}
