import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function scheduleTriggerNodeConfig(props: NodeConfigProps) {
  const { id, label, icon, position } = props

  const scheduleTriggerNode: NodeObjType = {
    id: id,
    type: 'scheduleTriggerNode',
    position,
    data: {
      label: label || 'Schedule Trigger',
      icon: icon || '/icons/schedule.png',
      triggerInterval: 'seconds',
      executionMode: 'auto',
      customSeconds: 6,
      customMinutes: 5,
      customHours: 1,
      daysBetween: 1,
      monthsBetween: 1,
      triggerOnDay: 1,
      triggerAtHour: 'Midnight',
      triggerAtMinute: 0,
      cronExpression: '* * * * *',
      rules: [],
      alwaysOutputData: true,
      executeOnce: false,
      retryOnFail: false,
      onError: 'stopWorkflow',
    },
    constraints: {
      nodeHandles: [
        {
          name: 'right',
          type: 'source',
          LinkTo: [
            { nodeName: 'agent', handlePosition: 'left' },
            { nodeName: 'inputNode', handlePosition: 'left' },
            { nodeName: 'tool', handlePosition: 'top' },
            { nodeName: 'outputNode', handlePosition: 'left' },
            { nodeName: 'gmailNode', handlePosition: 'left' },
            { nodeName: 'driveNode', handlePosition: 'left' },
            { nodeName: 'notionNode', handlePosition: 'left' },
            { nodeName: 'calendarNode', handlePosition: 'left' },
            { nodeName: 'slackNode', handlePosition: 'left' },
            { nodeName: 'discordNode', handlePosition: 'left' },
            { nodeName: 'modelNode', handlePosition: 'left' },
            { nodeName: 'embeddingModelNode', handlePosition: 'left' },
            { nodeName: 'vectordbNode', handlePosition: 'left' },
            { nodeName: 'httpNode', handlePosition: 'left' },
            { nodeName: 'sendDataNode', handlePosition: 'left' },
          ],
        },
      ],
    },
  } as NodeObjType

  return scheduleTriggerNode
}
